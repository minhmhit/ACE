import { VNPay } from "vnpay/vnpay";
import * as PaymentModel from "../models/PaymentModel.js";
import * as ReceiptModel from "../models/ReceiptModel.js";
import OrderModel from "../models/OrderModel.js";
import { pool } from "../config/db.js";
import { vnpayConfig, validateVnpayConfig } from "../config/vnpay.js";
import {
  formatVnpayDate,
  getVnpayResponseMessage,
  generateVnpayTxnRef,
} from "../utils/vnpayHelpers.js";

// Khởi tạo VNPay instance
validateVnpayConfig();
const vnpay = new VNPay({
  tmnCode: vnpayConfig.vnp_TmnCode,
  secureSecret: vnpayConfig.vnp_HashSecret,
  vnpayHost: vnpayConfig.vnp_Url,
  testMode: true,
  hashAlgorithm: "SHA512",
});

/**
 * Service xử lý logic nghiệp vụ thanh toán VNPay
 */
class VnpayService {
  /**
   * Tạo URL thanh toán VNPay
   * (Được gọi từ PaymentService.createPayment khi method = VNPAY)
   */
  static async createPaymentUrl(userId, paymentData) {
    // Order đã được validate bởi PaymentService, chỉ cần lấy lại
    const order = await PaymentModel.getOrderById(paymentData.orderId);

    // Lấy payment method VNPAY
    const paymentMethod = await PaymentModel.getPaymentMethodByCode("VNPAY");
    if (!paymentMethod) {
      const error = new Error(
        "Phương thức thanh toán VNPay chưa được cấu hình",
      );
      error.statusCode = 400;
      throw error;
    }

    // Tạo payment + ewallet detail trong transaction
    const conn = await pool.getConnection();
    let paymentId;
    try {
      await conn.beginTransaction();

      paymentId = await PaymentModel.create(conn, {
        orderId: paymentData.orderId,
        paymentMethodId: paymentMethod.payment_method_id,
        amount: order.totalAmount,
        currency: "VND",
        status: "PENDING",
      });

      const txnRef = generateVnpayTxnRef(paymentData.orderId);

      await PaymentModel.createEwalletDetails(conn, paymentId, {
        provider: "VNPAY",
        transactionId: txnRef,
      });

      await conn.commit();

      // Tạo URL thanh toán VNPay
      const amount = Math.round(order.totalAmount);
      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_TxnRef: txnRef,
        vnp_OrderInfo:
          paymentData.orderInfo || `Thanh toan don hang ${paymentData.orderId}`,
        vnp_OrderType: "other",
        vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
        vnp_IpAddr: paymentData.ipAddr || "127.0.0.1",
        vnp_Locale: paymentData.locale || "vn",
        vnp_CreateDate: formatVnpayDate(new Date()),
      });

      return {
        paymentId,
        paymentUrl,
        orderId: paymentData.orderId,
        amount,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Xác thực và xử lý callback từ VNPay (return URL)
   */
  static async verifyReturn(vnpayReturnData) {
    const isValid = vnpay.verifyReturnUrl(vnpayReturnData);
    if (!isValid) {
      const error = new Error("Chữ ký không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    const responseCode = vnpayReturnData.vnp_ResponseCode;
    const txnRef = vnpayReturnData.vnp_TxnRef;
    const amount = vnpayReturnData.vnp_Amount / 100;
    const transactionNo = vnpayReturnData.vnp_TransactionNo;

    const orderId = parseInt(txnRef.split("_")[0]);

    const payment = await PaymentModel.getByOrderId(orderId);
    if (!payment) {
      const error = new Error("Không tìm thấy thông tin thanh toán");
      error.statusCode = 404;
      throw error;
    }

    const order = await PaymentModel.getOrderById(orderId);

    // returnUrl chỉ để verify và hiển thị trạng thái cho user,
    // không finalize nghiệp vụ (không trừ kho, không xóa cart, không chốt order/payment).
    const paymentStatus = payment.status;
    const orderStatus = order?.status;
    const message =
      responseCode === "00"
        ? "Giao dịch đã được ghi nhận, chờ IPN xác nhận"
        : getVnpayResponseMessage(responseCode);

    return {
      success: responseCode === "00",
      message,
      orderId,
      paymentId: payment.payment_id,
      amount,
      transactionNo,
      responseCode,
      paymentStatus,
      orderStatus,
    };
  }

  /**
   * Xử lý IPN (Instant Payment Notification) từ VNPay
   */
  static async handleIPN(vnpayIpnData) {
    try {
      const isValid = vnpay.verifyReturnUrl(vnpayIpnData);
      if (!isValid) {
        return { RspCode: "97", Message: "Invalid Signature" };
      }

      const responseCode = vnpayIpnData.vnp_ResponseCode;
      const txnRef = vnpayIpnData.vnp_TxnRef;
      const amount = vnpayIpnData.vnp_Amount / 100;
      const orderId = parseInt(txnRef.split("_")[0]);

      const order = await PaymentModel.getOrderById(orderId);
      if (!order) {
        return { RspCode: "01", Message: "Order not found" };
      }

      if (amount !== order.totalAmount) {
        return { RspCode: "04", Message: "Invalid amount" };
      }

      const payment = await PaymentModel.getByOrderId(orderId);
      if (!payment) {
        return { RspCode: "01", Message: "Payment not found" };
      }

      if (payment.status === "SUCCESS") {
        return { RspCode: "02", Message: "Order already confirmed" };
      }

      if (responseCode === "00") {
        if (payment.status !== "PENDING") {
          return { RspCode: "02", Message: "Order already confirmed" };
        }

        const conn = await pool.getConnection();
        try {
          await conn.beginTransaction();

          await PaymentModel.updateStatusConn(
            conn,
            payment.payment_id,
            "SUCCESS",
          );

          // Finalize nghiệp vụ bán hàng tại IPN success
          await OrderModel.finalizeOrderAfterPayment(conn, orderId);

          const [existingReceipt] = await conn.query(
            `SELECT id FROM receipts WHERE payment_id = ? LIMIT 1`,
            [payment.payment_id],
          );

          if (existingReceipt.length === 0) {
            await ReceiptModel.create(conn, {
              paymentId: payment.payment_id,
              amount: payment.amount,
              orderId: orderId,
              paymentMethod: "vnpay",
              description: `Biên nhận VNPay IPN đơn hàng #${orderId}`,
            });
          }

          await conn.query(
            `UPDATE payment_ewallet_details
             SET transaction_id = ?, response_code = ?, paid_at = NOW()
             WHERE payment_id = ?`,
            [
              vnpayIpnData.vnp_TransactionNo || null,
              responseCode,
              payment.payment_id,
            ],
          );

          await conn.query(
            `UPDATE orders SET status = 'COMPLETED' WHERE id = ? AND status <> 'COMPLETED'`,
            [orderId],
          );

          await conn.commit();
        } catch (err) {
          await conn.rollback();
          throw err;
        } finally {
          conn.release();
        }
        return { RspCode: "00", Message: "Success" };
      } else {
        if (payment.status === "PENDING") {
          const conn = await pool.getConnection();
          try {
            await conn.beginTransaction();
            await PaymentModel.updateStatusConn(
              conn,
              payment.payment_id,
              "FAILED",
            );
            await PaymentModel.updateOrderStatusConn(
              conn,
              orderId,
              "CANCELLED",
            );
            await conn.query(
              `UPDATE payment_ewallet_details
               SET transaction_id = ?, response_code = ?, paid_at = NOW()
               WHERE payment_id = ?`,
              [
                vnpayIpnData.vnp_TransactionNo || null,
                responseCode,
                payment.payment_id,
              ],
            );
            await conn.commit();
          } catch (err) {
            await conn.rollback();
            throw err;
          } finally {
            conn.release();
          }
        }

        return { RspCode: "00", Message: "Success" };
      }
    } catch (error) {
      console.error("VNPay IPN Error:", error);
      return { RspCode: "99", Message: "Unknown error" };
    }
  }

  /**
   * Query thông tin giao dịch từ VNPay
   */
  static async queryTransaction(orderId, transactionDate) {
    const payment = await PaymentModel.getByOrderId(orderId);
    if (!payment) {
      const error = new Error("Không tìm thấy thông tin thanh toán");
      error.statusCode = 404;
      throw error;
    }

    const [rows] = await pool.query(
      "SELECT transaction_id FROM payment_ewallet_details WHERE payment_id = ?",
      [payment.payment_id],
    );
    const transactionId = rows[0]?.transaction_id;

    if (!transactionId) {
      const error = new Error("Không tìm thấy mã giao dịch");
      error.statusCode = 404;
      throw error;
    }

    const queryResult = vnpay.queryDr({
      vnp_TxnRef: transactionId,
      vnp_TransactionDate: transactionDate || formatVnpayDate(new Date()),
      vnp_CreateDate: formatVnpayDate(new Date()),
      vnp_IpAddr: "127.0.0.1",
    });

    return queryResult;
  }
}

export default VnpayService;
