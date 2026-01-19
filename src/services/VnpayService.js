import { VNPay } from "vnpay/vnpay";
import PaymentModel from "../models/PaymentModel.js";
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
  testMode: true, // Đổi thành false khi lên production
  hashAlgorithm: "SHA512",
});

/**
 * Service xử lý logic nghiệp vụ thanh toán VNPay
 */
class VnpayService {
  /**
   * Tạo URL thanh toán VNPay
   */
  static async createPaymentUrl(userId, paymentData) {
    try {
      // Kiểm tra order tồn tại và thuộc về user
      const order = await PaymentModel.getOrderById(paymentData.orderId);
      if (!order) {
        throw new Error("Đơn hàng không tồn tại");
      }

      if (order.userId !== userId) {
        throw new Error("Bạn không có quyền thanh toán đơn hàng này");
      }

      if (order.status !== "PENDING") {
        throw new Error(
          `Đơn hàng đang ở trạng thái ${order.status}, không thể thanh toán`,
        );
      }

      // Kiểm tra xem đơn hàng đã có payment chưa
      const existingPayment = await PaymentModel.getPaymentByOrderId(
        paymentData.orderId,
      );
      if (existingPayment && existingPayment.status === "SUCCESS") {
        throw new Error("Đơn hàng đã được thanh toán");
      }

      // Lấy payment method VNPAY
      const paymentMethod = await PaymentModel.getPaymentMethodByCode("VNPAY");
      if (!paymentMethod) {
        throw new Error("Phương thức thanh toán VNPay chưa được cấu hình");
      }

      // Tạo bản ghi payment
      const paymentId = await PaymentModel.createPayment({
        order_id: paymentData.orderId,
        payment_method_id: paymentMethod.payment_method_id,
        amount: order.totalAmount,
        currency: "VND",
        status: "PENDING",
      });

      // Tạo URL thanh toán VNPay
      const amount = Math.round(order.totalAmount); // VNPay yêu cầu số nguyên
      const txnRef = generateVnpayTxnRef(paymentData.orderId);

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

      // Lưu thông tin e-wallet
      await PaymentModel.createEwalletDetails(paymentId, {
        provider: "VNPAY",
        transaction_id: txnRef,
        response_code: null,
        paid_at: null,
      });

      return {
        paymentId,
        paymentUrl,
        orderId: paymentData.orderId,
        amount,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xác thực và xử lý callback từ VNPay (return URL)
   */
  static async verifyReturn(vnpayReturnData) {
    try {
      // Verify chữ ký
      const isValid = vnpay.verifyReturnUrl(vnpayReturnData);
      if (!isValid) {
        throw new Error("Chữ ký không hợp lệ");
      }

      const responseCode = vnpayReturnData.vnp_ResponseCode;
      const txnRef = vnpayReturnData.vnp_TxnRef;
      const amount = vnpayReturnData.vnp_Amount / 100; // VNPay trả về x100
      const transactionNo = vnpayReturnData.vnp_TransactionNo;

      // Lấy orderId từ txnRef (format: orderId_timestamp)
      const orderId = parseInt(txnRef.split("_")[0]);

      // Lấy payment
      const payment = await PaymentModel.getPaymentByOrderId(orderId);
      if (!payment) {
        throw new Error("Không tìm thấy thông tin thanh toán");
      }

      // Kiểm tra trạng thái thanh toán
      let paymentStatus = "FAILED";
      let orderStatus = "PENDING";
      let message = "Thanh toán thất bại";

      if (responseCode === "00") {
        paymentStatus = "SUCCESS";
        orderStatus = "COMPLETED";
        message = "Thanh toán thành công";

        // Cập nhật trạng thái payment và order
        await PaymentModel.updatePaymentStatus(
          payment.payment_id,
          paymentStatus,
        );
        await PaymentModel.updateOrderStatus(orderId, orderStatus);

        // Cập nhật thông tin e-wallet details
        await this.updateEwalletDetails(
          payment.payment_id,
          transactionNo,
          responseCode,
        );
      } else {
        await PaymentModel.updatePaymentStatus(
          payment.payment_id,
          paymentStatus,
        );
        message = getVnpayResponseMessage(responseCode);
      }

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
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xử lý IPN (Instant Payment Notification) từ VNPay
   */
  static async handleIPN(vnpayIpnData) {
    try {
      // Verify chữ ký
      const isValid = vnpay.verifyReturnUrl(vnpayIpnData);
      if (!isValid) {
        return {
          RspCode: "97",
          Message: "Invalid Signature",
        };
      }

      const responseCode = vnpayIpnData.vnp_ResponseCode;
      const txnRef = vnpayIpnData.vnp_TxnRef;
      const amount = vnpayIpnData.vnp_Amount / 100;

      // Lấy orderId
      const orderId = parseInt(txnRef.split("_")[0]);

      // Kiểm tra order tồn tại
      const order = await PaymentModel.getOrderById(orderId);
      if (!order) {
        return {
          RspCode: "01",
          Message: "Order not found",
        };
      }

      // Kiểm tra số tiền
      if (amount !== order.totalAmount) {
        return {
          RspCode: "04",
          Message: "Invalid amount",
        };
      }

      // Lấy payment
      const payment = await PaymentModel.getPaymentByOrderId(orderId);
      if (!payment) {
        return {
          RspCode: "01",
          Message: "Payment not found",
        };
      }

      // Kiểm tra payment đã được xử lý chưa
      if (payment.status === "SUCCESS") {
        return {
          RspCode: "02",
          Message: "Order already confirmed",
        };
      }

      // Xử lý theo response code
      if (responseCode === "00") {
        await PaymentModel.updatePaymentStatus(payment.payment_id, "SUCCESS");
        await PaymentModel.updateOrderStatus(orderId, "COMPLETED");

        return {
          RspCode: "00",
          Message: "Success",
        };
      } else {
        await PaymentModel.updatePaymentStatus(payment.payment_id, "FAILED");

        return {
          RspCode: "00",
          Message: "Success",
        };
      }
    } catch (error) {
      console.error("VNPay IPN Error:", error);
      return {
        RspCode: "99",
        Message: "Unknown error",
      };
    }
  }

  /**
   * Query thông tin giao dịch từ VNPay
   */
  static async queryTransaction(orderId, transactionDate) {
    try {
      // Lấy payment
      const payment = await PaymentModel.getPaymentByOrderId(orderId);
      if (!payment) {
        throw new Error("Không tìm thấy thông tin thanh toán");
      }

      // Lấy transaction_id từ ewallet details
      const conn = await PaymentModel.pool?.getConnection();
      let transactionId = null;
      if (conn) {
        try {
          const [rows] = await conn.query(
            `SELECT transaction_id FROM payment_ewallet_details WHERE payment_id = ?`,
            [payment.payment_id],
          );
          transactionId = rows[0]?.transaction_id;
        } finally {
          conn.release();
        }
      }

      if (!transactionId) {
        throw new Error("Không tìm thấy mã giao dịch");
      }

      // Query từ VNPay API
      const queryResult = vnpay.queryDr({
        vnp_TxnRef: transactionId,
        vnp_TransactionDate: transactionDate || formatVnpayDate(new Date()),
        vnp_CreateDate: formatVnpayDate(new Date()),
        vnp_IpAddr: "127.0.0.1",
      });

      return queryResult;
    } catch (error) {
      throw error;
    }
  }

/**
 * Helper: Cập nhật thông tin e-wallet details
 */
static async updateEwalletDetails(paymentId, transactionNo, responseCode) {
  try {
    const result = await PaymentModel.updateEwalletDetails(paymentId,transactionNo,responseCode)
    return result;
  } catch (error) {
    throw(error);    
  }
}
}

export default VnpayService;
