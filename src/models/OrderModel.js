import pool from "../config/db.js";

class OrderModel {
  // Tạo đơn hàng mới
  static async createOrder(userId, orderData, items) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Tạo đơn hàng
      const [order] = await conn.query(
        `INSERT INTO orders (userId, totalAmount, orderDate, status, couponId)
         VALUES (?, ?, CURRENT_TIMESTAMP, 'PENDING', ?)`,
        [userId, orderData.totalAmount, orderData.couponId]
      );

      const orderId = order.insertId;

      // Thêm các sản phẩm vào chi tiết đơn hàng
      for (const item of items) {
        await conn.query(
          `INSERT INTO order_items (orderId, productId, variantId, quantity, unitPrice)
           VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            item.productId,
            item.variantId,
            item.quantity,
            item.unitPrice,
          ]
        );
      }

      await conn.commit();
      return orderId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Lấy danh sách đơn hàng của user
  static async getOrdersByUser(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [orders] = await pool.query(
      `SELECT o.*, 
              COUNT(*) OVER() as total_count
       FROM orders o
       WHERE o.userId = ?
       ORDER BY o.orderDate DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return orders;
  }

  // Lấy chi tiết đơn hàng
  static async getOrderById(orderId, userId = null) {
    const [order] = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email
       FROM orders o
       JOIN users u ON o.userId = u.id
       WHERE o.id = ? ${userId ? "AND o.userId = ?" : ""}
       LIMIT 1`,
      userId ? [orderId, userId] : [orderId]
    );

    if (order.length === 0) return null;

    const [items] = await pool.query(
      `SELECT oi.*, p.name as product_name, v.name as variant_name
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       LEFT JOIN variants v ON oi.variantId = v.id
       WHERE oi.orderId = ?`,
      [orderId]
    );

    return {
      ...order[0],
      items,
    };
  }

  // Hủy đơn hàng
  static async cancelOrder(orderId, userId) {
    const [result] = await pool.query(
      `UPDATE orders 
       SET status = 'CANCELLED'
       WHERE id = ? AND userId = ? AND status = 'PENDING'`,
      [orderId, userId]
    );
    return result.affectedRows > 0;
  }

  // Admin: Lấy tất cả đơn hàng
  static async getAllOrders(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    const params = [];
    let statusFilter = "";

    if (status) {
      statusFilter = "WHERE o.status = ?";
      params.push(status);
    }

    params.push(limit, offset);

    const [orders] = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email,
              COUNT(*) OVER() as total_count
       FROM orders o
       JOIN users u ON o.userId = u.id
       ${statusFilter}
       ORDER BY o.orderDate DESC
       LIMIT ? OFFSET ?`,
      params
    );
    return orders;
  }

  // Admin: Cập nhật trạng thái đơn hàng
  static async updateOrderStatus(orderId, status) {
    const validStatuses = ["PENDING", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      throw new Error("Trạng thái đơn hàng không hợp lệ");
    }

    const [result] = await pool.query(
      `UPDATE orders SET status = ? WHERE id = ?`,
      [status, orderId]
    );
    return result.affectedRows > 0;
  }
}

export default OrderModel;
