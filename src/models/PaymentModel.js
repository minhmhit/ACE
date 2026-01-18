import { pool } from "../config/db.js";

/**
 * Model xử lý các truy vấn SQL liên quan đến thanh toán
 */
class PaymentModel {
  /**
   * Tạo bản ghi thanh toán mới
   */
  static async createPayment(paymentData) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(
        `INSERT INTO payments (order_id, payment_method_id, amount, currency, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          paymentData.order_id,
          paymentData.payment_method_id,
          paymentData.amount,
          paymentData.currency || "VND",
          paymentData.status || "PENDING",
        ]
      );
      return result.insertId;
    } finally {
      conn.release();
    }
  }

  /**
   * Lưu thông tin chi tiết thanh toán e-wallet (VNPay, Momo)
   */
  static async createEwalletDetails(paymentId, ewalletData) {
    const conn = await pool.getConnection();
    try {
      await conn.query(
        `INSERT INTO payment_ewallet_details (payment_id, provider, transaction_id, response_code, paid_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          paymentId,
          ewalletData.provider,
          ewalletData.transaction_id || null,
          ewalletData.response_code || null,
          ewalletData.paid_at || null,
        ]
      );
    } finally {
      conn.release();
    }
  }

  /**
   * Cập nhật trạng thái thanh toán
   */
  static async updatePaymentStatus(paymentId, status) {
    const conn = await pool.getConnection();
    try {
      await conn.query(
        `UPDATE payments SET status = ?, updated_at = NOW() WHERE payment_id = ?`,
        [status, paymentId]
      );
    } finally {
      conn.release();
    }
  }

  /**
   * Lấy thông tin thanh toán theo order_id
   */
  static async getPaymentByOrderId(orderId) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT p.*, pm.code as payment_method_code, pm.name as payment_method_name
         FROM payments p
         JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
         WHERE p.order_id = ?
         ORDER BY p.created_at DESC
         LIMIT 1`,
        [orderId]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  /**
   * Lấy thông tin thanh toán theo payment_id
   */
  static async getPaymentById(paymentId) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT p.*, pm.code as payment_method_code, pm.name as payment_method_name,
         e.provider, e.transaction_id, e.response_code, e.paid_at
         FROM payments p
         JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
         LEFT JOIN payment_ewallet_details e ON p.payment_id = e.payment_id
         WHERE p.payment_id = ?`,
        [paymentId]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  /**
   * Lấy payment_method_id theo code
   */
  static async getPaymentMethodByCode(code) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT payment_method_id, code, name, is_active 
         FROM payment_methods 
         WHERE code = ? AND is_active = 1`,
        [code]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  /**
   * Lấy thông tin đơn hàng theo order_id
   */
  static async getOrderById(orderId) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT id, userId, totalAmount, status, shipAddress, orderDate, couponId
         FROM orders
         WHERE id = ?`,
        [orderId]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  static async updateOrderStatus(orderId, status) {
    const conn = await pool.getConnection();
    try {
      await conn.query(`UPDATE orders SET status = ? WHERE id = ?`, [
        status,
        orderId,
      ]);
    } finally {
      conn.release();
    }
  }

  /**
   * Lấy danh sách thanh toán theo user (phân trang)
   */
  static async getPaymentsByUser(userId, page = 1, limit = 10) {
    const conn = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;
      const [rows] = await conn.query(
        `SELECT p.payment_id, p.order_id, p.amount, p.currency, p.status, 
         p.created_at, pm.name as payment_method_name, o.orderDate
         FROM payments p
         JOIN orders o ON p.order_id = o.id
         JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
         WHERE o.userId = ?
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      return rows;
    } finally {
      conn.release();
    }
  }
}

export default PaymentModel;
