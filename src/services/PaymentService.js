import { pool } from "../config/db.js";
import * as PaymentModel from "../models/PaymentModel.js";
import * as ReceiptModel from "../models/ReceiptModel.js";
import VnpayService from "./VnpayService.js";

// ============================================
// Service xử lý logic nghiệp vụ thanh toán
// ============================================

// Map payment_method code -> loại detail
const METHOD_DETAIL_MAP = {
  CASH: null, // không cần detail
  CARD: "card",
  MOMO: "ewallet",
  VNPAY: "ewallet",
  PAYPAL: "ewallet",
};

// Map payment_method code -> receipt payment_method field
const METHOD_RECEIPT_MAP = {
  CASH: "cash",
  CARD: "credit_card",
  MOMO: "momo",
  VNPAY: "vnpay",
  PAYPAL: "paypal",
};

/**
 * Tạo payment cho đơn hàng
 * Flow: validate order → check existing payment → create payment + detail → (VNPay: trả URL)
 */
export async function createPayment(userId, data) {
  // Kiểm tra order
  const order = await PaymentModel.getOrderById(data.orderId);
  if (!order) {
    const error = new Error("Đơn hàng không tồn tại");
    error.statusCode = 404;
    throw error;
  }
  if (order.userId !== userId) {
    const error = new Error("Bạn không có quyền thanh toán đơn hàng này");
    error.statusCode = 403;
    throw error;
  }
  if (order.status !== "PENDING") {
    const error = new Error(
      `Đơn hàng đang ở trạng thái ${order.status}, không thể thanh toán`,
    );
    error.statusCode = 400;
    throw error;
  }

  // Kiểm tra đã có payment SUCCESS
  const existingPayment = await PaymentModel.getByOrderId(data.orderId);
  if (existingPayment && existingPayment.status === "SUCCESS") {
    const error = new Error("Đơn hàng đã được thanh toán");
    error.statusCode = 400;
    throw error;
  }

  // Lấy payment method
  const method = await PaymentModel.getPaymentMethodByCode(
    data.paymentMethodCode,
  );
  if (!method) {
    const error = new Error(
      `Phương thức thanh toán ${data.paymentMethodCode} không khả dụng`,
    );
    error.statusCode = 400;
    throw error;
  }

  // Nếu VNPay → delegate sang VnpayService
  if (data.paymentMethodCode === "VNPAY") {
    return await VnpayService.createPaymentUrl(userId, {
      orderId: data.orderId,
      orderInfo: data.orderInfo,
      ipAddr: data.ipAddr,
      locale: data.locale,
    });
  }

  // Các method khác: tạo payment + detail trong transaction
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const paymentId = await PaymentModel.create(conn, {
      orderId: data.orderId,
      paymentMethodId: method.payment_method_id,
      amount: order.totalAmount,
      currency: "VND",
      status: "PENDING",
    });

    // Tạo detail tương ứng
    const detailType = METHOD_DETAIL_MAP[data.paymentMethodCode];
    if (detailType === "ewallet") {
      await PaymentModel.createEwalletDetails(conn, paymentId, {
        provider: data.paymentMethodCode, // MOMO, PAYPAL...
        transactionId: data.transactionId || null,
      });
    } else if (detailType === "card") {
      await PaymentModel.createCardDetails(conn, paymentId, {
        cardType: data.cardType,
        last4Digits: data.last4Digits,
        cardHolderName: data.cardHolderName,
        bankName: data.bankName,
      });
    }
    // CASH: không cần detail

    await conn.commit();

    const payment = await PaymentModel.getById(paymentId);
    return formatPaymentResponse(payment);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Admin/Sale xác nhận thanh toán thành công (COD, chuyển khoản...)
 * Flow: payment PENDING → SUCCESS → order COMPLETED → tự tạo receipt
 */
export async function confirmPayment(paymentId) {
  const payment = await PaymentModel.getById(paymentId);
  if (!payment) {
    const error = new Error("Không tìm thấy thanh toán");
    error.statusCode = 404;
    throw error;
  }
  if (payment.status !== "PENDING") {
    const error = new Error(
      `Thanh toán đang ở trạng thái ${payment.status}, không thể xác nhận`,
    );
    error.statusCode = 400;
    throw error;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Cập nhật payment → SUCCESS
    await PaymentModel.updateStatusConn(conn, paymentId, "SUCCESS");

    // Cập nhật order → COMPLETED
    await PaymentModel.updateOrderStatusConn(
      conn,
      payment.order_id,
      "COMPLETED",
    );

    // Tự động tạo receipt
    const receiptMethod =
      METHOD_RECEIPT_MAP[payment.payment_method_code] || "cash";
    await ReceiptModel.create(conn, {
      paymentId: paymentId,
      amount: payment.amount,
      orderId: payment.order_id,
      paymentMethod: receiptMethod,
      description: `Biên nhận thanh toán đơn hàng #${payment.order_id}`,
    });

    await conn.commit();

    const updated = await PaymentModel.getById(paymentId);
    return formatPaymentResponse(updated);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Admin đánh dấu thanh toán thất bại
 */
export async function failPayment(paymentId) {
  const payment = await PaymentModel.getById(paymentId);
  if (!payment) {
    const error = new Error("Không tìm thấy thanh toán");
    error.statusCode = 404;
    throw error;
  }
  if (payment.status !== "PENDING") {
    const error = new Error(
      `Thanh toán đang ở trạng thái ${payment.status}, không thể đánh dấu thất bại`,
    );
    error.statusCode = 400;
    throw error;
  }

  await PaymentModel.updateStatus(paymentId, "FAILED");

  const updated = await PaymentModel.getById(paymentId);
  return formatPaymentResponse(updated);
}

/**
 * Lấy thông tin payment theo id
 */
export async function getPaymentById(paymentId) {
  const payment = await PaymentModel.getById(paymentId);
  if (!payment) {
    const error = new Error("Không tìm thấy thanh toán");
    error.statusCode = 404;
    throw error;
  }
  return formatPaymentResponse(payment);
}

/**
 * Lấy payment của đơn hàng (kiểm tra quyền truy cập)
 */
export async function getOrderPayment(orderId, userId, roleCode) {
  const order = await PaymentModel.getOrderById(orderId);
  if (!order) {
    const error = new Error("Đơn hàng không tồn tại");
    error.statusCode = 404;
    throw error;
  }

  // Chỉ admin/sale hoặc chủ đơn hàng mới xem được
  if (roleCode !== "ADMIN" && roleCode !== "SALE" && order.userId !== userId) {
    const error = new Error("Bạn không có quyền xem thanh toán đơn hàng này");
    error.statusCode = 403;
    throw error;
  }

  const payment = await PaymentModel.getByOrderId(orderId);
  if (!payment) {
    const error = new Error("Đơn hàng chưa có thanh toán");
    error.statusCode = 404;
    throw error;
  }
  return formatPaymentResponse(payment);
}

/**
 * Lịch sử thanh toán của user
 */
export async function getPaymentHistory(userId, page = 1, limit = 10) {
  return await PaymentModel.getByUserId({ userId, page, limit });
}

/**
 * Admin lấy danh sách payment (phân trang + filter)
 */
export async function getAllPayments({
  status,
  paymentMethodCode,
  page = 1,
  limit = 10,
}) {
  return await PaymentModel.getAll({ status, paymentMethodCode, page, limit });
}

/**
 * Lấy danh sách payment methods
 */
export async function getPaymentMethods() {
  return await PaymentModel.getAllPaymentMethods();
}

// === VNPay delegation (giữ nguyên flow cũ) ===

export async function verifyVnpayReturn(vnpayReturnData) {
  return await VnpayService.verifyReturn(vnpayReturnData);
}

export async function handleVnpayIPN(vnpayIpnData) {
  return await VnpayService.handleIPN(vnpayIpnData);
}

export async function queryVnpayTransaction(orderId, transactionDate) {
  return await VnpayService.queryTransaction(orderId, transactionDate);
}

// ============================================
// Helper format response
// ============================================

function formatPaymentResponse(row) {
  if (!row) return null;

  const result = {
    paymentId: row.payment_id,
    orderId: row.order_id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
    paymentMethod: {
      code: row.payment_method_code,
      name: row.payment_method_name,
    },
  };

  // Thêm chi tiết theo loại
  if (row.ewallet_provider) {
    result.ewalletDetails = {
      provider: row.ewallet_provider,
      transactionId: row.ewallet_transaction_id,
      responseCode: row.ewallet_response_code,
      paidAt: row.ewallet_paid_at,
    };
  }
  if (row.bank_transfer_bank || row.bank_transfer_account) {
    result.bankTransferDetails = {
      bankName: row.bank_transfer_bank,
      accountNumber: row.bank_transfer_account,
      transferReference: row.bank_transfer_reference,
    };
  }
  if (row.card_type || row.last_4_digits) {
    result.cardDetails = {
      cardType: row.card_type,
      last4Digits: row.last_4_digits,
      cardHolderName: row.card_holder_name,
      bankName: row.card_bank_name,
    };
  }

  return result;
}
