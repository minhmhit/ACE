import * as PaymentService from "../services/PaymentService.js";

// ============================================
// Controller xử lý request/response thanh toán
// ============================================

/**
 * POST /api/v1/payments
 * Tạo payment cho đơn hàng
 */
export async function createPayment(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await PaymentService.createPayment(userId, {
      orderId: req.body.orderId,
      paymentMethodCode: req.body.paymentMethodCode,
      // VNPay fields
      orderInfo: req.body.orderInfo,
      ipAddr: req.ip,
      locale: req.body.locale,
      // Card fields
      cardType: req.body.cardType,
      last4Digits: req.body.last4Digits,
      cardHolderName: req.body.cardHolderName,
      bankName: req.body.bankName,
      // Ewallet fields
      transactionId: req.body.transactionId,
    });

    res.status(201).json({
      message: "Tạo thanh toán thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/payments/:id
 * Lấy thông tin payment theo id
 */
export async function getPaymentById(req, res, next) {
  try {
    const payment = await PaymentService.getPaymentById(
      parseInt(req.params.id),
    );
    res.json({ data: payment });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/orders/:orderId/payment
 * Lấy payment của đơn hàng (user xem đơn mình, admin/sale xem tất cả)
 */
export async function getOrderPayment(req, res, next) {
  try {
    const userId = req.user.id;
    const roleCode = req.user.role.code;
    const orderId = parseInt(req.params.orderId);

    const payment = await PaymentService.getOrderPayment(
      orderId,
      userId,
      roleCode,
    );
    res.json({ data: payment });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/payments/:id/confirm
 * Admin/Sale xác nhận thanh toán thành công
 */
export async function confirmPayment(req, res, next) {
  try {
    const result = await PaymentService.confirmPayment(parseInt(req.params.id));
    res.json({
      message: "Xác nhận thanh toán thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/payments/:id/fail
 * Admin đánh dấu thanh toán thất bại
 */
export async function failPayment(req, res, next) {
  try {
    const result = await PaymentService.failPayment(parseInt(req.params.id));
    res.json({
      message: "Đã đánh dấu thanh toán thất bại",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/payments/history
 * Lấy lịch sử thanh toán của user đang đăng nhập
 */
export async function getPaymentHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await PaymentService.getPaymentHistory(userId, page, limit);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/payments
 * Admin lấy danh sách payments (phân trang + filter)
 */
export async function getAllPayments(req, res, next) {
  try {
    const { status, paymentMethodCode, page, limit } = req.query;
    const result = await PaymentService.getAllPayments({
      status,
      paymentMethodCode,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/payments/methods
 * Lấy danh sách payment methods
 */
export async function getPaymentMethods(req, res, next) {
  try {
    const methods = await PaymentService.getPaymentMethods();
    res.json({ data: methods });
  } catch (error) {
    next(error);
  }
}

// === VNPay callback endpoints ===

/**
 * GET /api/v1/payments/vnpay/return
 * VNPay redirect sau thanh toán
 */
export async function handleVnpayReturn(req, res, next) {
  try {
    const result = await PaymentService.verifyVnpayReturn(req.query);
    res.json({
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/payments/vnpay/ipn
 * VNPay IPN callback
 */
export async function handleVnpayIPN(req, res, next) {
  try {
    const result = await PaymentService.handleVnpayIPN(req.query);
    res.json(result);
  } catch (error) {
    res.json({ RspCode: "99", Message: "Unknown error" });
  }
}

/**
 * GET /api/v1/payments/vnpay/query/:orderId
 * Query giao dịch VNPay
 */
export async function queryVnpayTransaction(req, res, next) {
  try {
    const result = await PaymentService.queryVnpayTransaction(
      parseInt(req.params.orderId),
      req.query.transactionDate,
    );
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}
