import PaymentService from "../services/PaymentService.js";

/**
 * Controller xử lý request/response cho các API thanh toán VNPay
 */
class PaymentController {
  /**
   * Tạo URL thanh toán VNPay
   * POST /api/v1/payment/vnpay/create
   */
  static async createVnpayPayment(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId, orderInfo, locale } = req.body;

      // Lấy IP address của client
      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        "127.0.0.1";

      const paymentData = {
        orderId,
        orderInfo,
        ipAddr: ipAddr.replace("::ffff:", ""), // Remove IPv6 prefix
        locale: locale || "vn",
      };

      const result = await PaymentService.createVnpayPaymentUrl(
        userId,
        paymentData,
      );

      res.status(201).json({
        success: true,
        message: "Tạo URL thanh toán thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xử lý VNPay return (callback sau khi thanh toán)
   * GET /api/v1/payment/vnpay/return
   */
  static async handleVnpayReturn(req, res, next) {
    try {
      const vnpayData = req.query;
      const result = await PaymentService.verifyVnpayReturn(vnpayData);
      // Redirect user về trang kết quả thanh toán trên frontend
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-result?orderId=${result.orderId}`,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * lấy thông tin payment result trả về cho frontend
   * GET /api/v1/payments/result/:orderId
   */
  static async getPaymentResult(req, res, next) {
    try {
      const { orderId } = req.query;

      const payment = await PaymentService.getPaymentByOrderId(orderId);
      if (!payment) {
        return res.status(404).json({ message: "Không tìm thấy payment" });
      }

      res.json({
        success: payment.status === "SUCCESS",
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xử lý VNPay IPN (Instant Payment Notification)
   * GET /api/v1/payment/vnpay/ipn
   */
  static async handleVnpayIPN(req, res, next) {
    try {
      const vnpayData = req.query;

      const result = await PaymentService.handleVnpayIPN(vnpayData);

      // Trả về response theo format VNPay yêu cầu
      res.json(result);
    } catch (error) {
      // IPN phải luôn trả về response, không throw error
      res.json({
        RspCode: "99",
        Message: "Unknown error",
      });
    }
  }

  /**
   * Query thông tin giao dịch từ VNPay
   * GET /api/v1/payment/vnpay/query/:orderId
   */
  static async queryTransaction(req, res, next) {
    try {
      const userId = req.user.id;
      const orderId = parseInt(req.params.orderId);
      const transactionDate = req.query.transactionDate;

      // Kiểm tra user có quyền xem order này không
      // (Có thể thêm logic check ownership)

      const result = await PaymentService.queryVnpayTransaction(
        orderId,
        transactionDate,
      );

      res.json({
        success: true,
        message: "Truy vấn thông tin giao dịch thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy lịch sử thanh toán của user
   * GET /api/v1/payment/history
   */
  static async getPaymentHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const payments = await PaymentService.getPaymentHistory(
        userId,
        page,
        limit,
      );

      res.json({
        success: true,
        message: "Lấy lịch sử thanh toán thành công",
        data: payments,
        pagination: {
          page,
          limit,
          total: payments.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PaymentController;
