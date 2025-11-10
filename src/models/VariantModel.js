import { pool } from "../config/db.js";

class VariantModel {
  // Lấy tất cả variants của một sản phẩm
  static async getVariantsByProductId(productId) {
    const [rows] = await pool.query(
      `SELECT v.*, p.name as productName, p.price as basePrice 
             FROM variants v 
             JOIN products p ON v.productId = p.id 
             WHERE v.productId = ?`,
      [productId]
    );
    return rows;
  }

  // Lấy chi tiết một variant
  static async getVariantById(id) {
    const [rows] = await pool.query(
      `SELECT v.*, p.name as productName, p.price as basePrice 
             FROM variants v 
             JOIN products p ON v.productId = p.id 
             WHERE v.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Tạo variant mới
  static async createVariant(data) {
    const [result] = await pool.query(
      "INSERT INTO variants (name, productId, additionalPrice) VALUES (?, ?, ?)",
      [data.name, data.productId, data.additionalPrice]
    );
    return result.insertId;
  }

  // Cập nhật variant
  static async updateVariant(id, data) {
    const [result] = await pool.query(
      "UPDATE variants SET name = ?, additionalPrice = ? WHERE id = ?",
      [data.name, data.additionalPrice, id]
    );
    return result.affectedRows > 0;
  }

  // Xóa variant
  static async deleteVariant(id) {
    const [result] = await pool.query("DELETE FROM variants WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }

  // Kiểm tra xem variant có đang được sử dụng trong cart_items hoặc order_items không
  static async checkVariantUsage(id) {
    const [cartItems] = await pool.query(
      "SELECT COUNT(*) as count FROM cart_items WHERE variantId = ?",
      [id]
    );
    const [orderItems] = await pool.query(
      "SELECT COUNT(*) as count FROM order_items WHERE variantId = ?",
      [id]
    );

    return {
      inCart: cartItems[0].count > 0,
      inOrders: orderItems[0].count > 0,
    };
  }
}

export default VariantModel;
