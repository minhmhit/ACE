import PaymentModel from "../models/PaymentModel.js";
import VnpayService from "./VnpayService.js";

/**
 * Service xử lý logic nghiệp vụ thanh toán chung
 */
class PaymentService {
  /**
   * Tạo URL thanh toán VNPay
   */
  static async createVnpayPaymentUrl(userId, paymentData) {
    return await VnpayService.createPaymentUrl(userId, paymentData);
  }
  /**
   * Xác thực callback từ VNPay
   */
  static async verifyVnpayReturn(vnpayReturnData) {
    return await VnpayService.verifyReturn(vnpayReturnData);
  }
  /**
   * Xử lý IPN từ VNPay
   */
  static async handleVnpayIPN(vnpayIpnData) {
    return await VnpayService.handleIPN(vnpayIpnData);
  }

  /**
   * Query thông tin giao dịch từ VNPay
   */
  static async queryVnpayTransaction(orderId, transactionDate) {
    return await VnpayService.queryTransaction(orderId, transactionDate);
  }

  /**
   * Lấy thông tin payment theo orderId
   */
  static async getPaymentByOrderId(orderId) {
    try {
      const payment = await PaymentModel.getPaymentByOrderId(orderId);
      return payment;
    } catch (error) {
      throw error;
    }
  }
  /**
   * Lấy lịch sử thanh toán của user
   */
  static async getPaymentHistory(userId, page = 1, limit = 10) {
    try {
      const payments = await PaymentModel.getPaymentsByUser(
        userId,
        page,
        limit,
      );
      return payments;
    } catch (error) {
      throw error;
    }
  }
}

export default PaymentService;
