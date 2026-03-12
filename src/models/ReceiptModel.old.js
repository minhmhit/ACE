import {pool} from "../config/db.js";

class ReceiptModel {
  // Tạo phiếu thu mới
  static async create(receipt) {
    const [result] = await pool.execute(
      "INSERT INTO receipts (amount, order_id, payment_method, description) VALUES (?, ?, ?, ?)",
      [
        receipt.amount,
        receipt.order_id,
        receipt.payment_method,
        receipt.description,
      ]
    );
    return result.insertId;
  }

  // Lấy thông tin phiếu thu theo ID
  static async getById(id) {
    const [rows] = await pool.execute(
      "SELECT r.*, o.status as order_status FROM receipts r JOIN orders o ON r.order_id = o.id WHERE r.id = ?",
      [id]
    );
    return rows[0];
  }

  // Lấy phiếu thu theo order_id
  static async getByOrderId(orderId) {
    const [rows] = await pool.execute(
      "SELECT * FROM receipts WHERE order_id = ?",
      [orderId]
    );
    return rows[0];
  }

  // Lấy danh sách phiếu thu có phân trang và filter
  static async getAll(page = 1, limit = 10, filters = {}) {
    let query =
      "SELECT r.*, o.status as order_status FROM receipts r JOIN orders o ON r.order_id = o.id";
    const params = [];

    // Xây dựng điều kiện filter
    if (filters.payment_method) {
      query += " WHERE r.payment_method = ?";
      params.push(filters.payment_method);
    }

    // Thêm LIMIT và OFFSET cho phân trang
    const offset = (page - 1) * limit;
    query += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    // Lấy tổng số phiếu thu để tính số trang
    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM receipts" +
        (filters.payment_method ? " WHERE payment_method = ?" : ""),
      filters.payment_method ? [filters.payment_method] : []
    );

    return {
      receipts: rows,
      total: countResult[0].total,
      page: page,
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  // Cập nhật thông tin phiếu thu
  static async update(id, updates) {
    const [result] = await pool.execute(
      "UPDATE receipts SET description = ? WHERE id = ?",
      [updates.description, id]
    );
    return result.affectedRows > 0;
  }

  // Xóa phiếu thu
  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM receipts WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }
}

export default ReceiptModel;
