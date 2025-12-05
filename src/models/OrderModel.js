import { pool } from "../config/db.js";

class OrderModel {
  // Tạo đơn hàng mới từ cart items
  static async createOrder(userId, orderData, cartItems) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Tính tổng tiền từ cart items
      let totalAmount = 0;
      for (const item of cartItems) {
        totalAmount += item.unitPrice * item.quantity;
      }

      // Áp dụng giảm giá nếu có coupon
      if (orderData.couponId) {
        const [coupon] = await conn.query(
          `SELECT discountPercent FROM coupons 
           WHERE id = ? AND validFrom <= NOW() AND validUntil >= NOW()`,
          [orderData.couponId]
        );

        if (coupon.length > 0) {
          const discount = (totalAmount * coupon[0].discountPercent) / 100;
          totalAmount -= discount;
        }
      }
      // Tạo đơn hàng
      // console.log(orderData);

      const [order] = await conn.query(
        `INSERT INTO orders (userId, totalAmount, orderDate, shipAddress, status, couponId)
         VALUES (?, ?, NOW(), ?, 'PENDING', ?)`,
        [
          userId,
          totalAmount,
          orderData.shipAddress || null,
          orderData.couponId || null,
        ]
      );

      const orderId = order.insertId;

      // Thêm các sản phẩm vào order_items và cập nhật kho
      for (const item of cartItems) {
        // Kiểm tra tồn kho
        const [inventory] = await conn.query(
          `SELECT quantity FROM inventories WHERE productId = ?`,
          [item.productId]
        );

        if (!inventory.length || inventory[0].quantity < item.quantity) {
          throw new Error(
            `Sản phẩm ID ${item.productId} không đủ hàng trong kho`
          );
        }

        // Thêm vào order_items
        await conn.query(
          `INSERT INTO order_items (orderId, productId, variantId, quantity, unitPrice)
           VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            item.productId,
            item.variantId || null,
            item.quantity,
            item.unitPrice,
          ]
        );

        // Giảm số lượng trong kho
        await conn.query(
          `UPDATE inventories 
           SET quantity = quantity - ? 
           WHERE productId = ?`,
          [item.quantity, item.productId]
        );

        // Giảm số lượng trong cart hoặc xóa nếu = 0
        const newCartQuantity = item.cartQuantity - item.quantity;

        if (newCartQuantity <= 0) {
          // Xóa item khỏi cart
          await conn.query(`DELETE FROM cart_items WHERE id = ?`, [
            item.cartItemId,
          ]);
        } else {
          // Cập nhật số lượng mới
          await conn.query(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [
            newCartQuantity,
            item.cartItemId,
          ]);
        }
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
      `SELECT o.id, o.totalAmount, o.orderDate, o.status, o.couponId, o.shipAddress,
              (SELECT COUNT(*) FROM orders WHERE userId = ?) as total_count
       FROM orders o
       WHERE o.userId = ?
       ORDER BY o.orderDate DESC
       LIMIT ? OFFSET ?`,
      [userId, userId, limit, offset]
    );
    return orders;
  }

  // Lấy chi tiết đơn hàng
  static async getOrderById(orderId, userId = null) {
    let query = `SELECT o.*, u.name as customerName, u.email, u.phoneNumber
                 FROM orders o
                 JOIN users u ON o.userId = u.id
                 WHERE o.id = ?`;
    const params = [orderId];

    if (userId) {
      query += ` AND o.userId = ?`;
      params.push(userId);
    }

    const [order] = await pool.query(query, params);

    if (order.length === 0) return null;

    // Lấy chi tiết sản phẩm
    const [items] = await pool.query(
      `SELECT oi.*, 
              p.name as productName, 
              p.imageUrl,
              v.name as variantName
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

  // Hủy đơn hàng (chỉ cho phép hủy đơn PENDING)
  static async cancelOrder(orderId, userId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Kiểm tra đơn hàng
      const [order] = await conn.query(
        `SELECT * FROM orders 
         WHERE id = ? AND userId = ? AND status = 'PENDING'`,
        [orderId, userId]
      );

      if (order.length === 0) {
        throw new Error("Không thể hủy đơn hàng này");
      }

      // Lấy các sản phẩm trong đơn hàng
      const [items] = await conn.query(
        `SELECT productId, quantity FROM order_items WHERE orderId = ?`,
        [orderId]
      );

      // Hoàn trả số lượng vào kho
      for (const item of items) {
        await conn.query(
          `UPDATE inventories 
           SET quantity = quantity + ? 
           WHERE productId = ?`,
          [item.quantity, item.productId]
        );
      }

      // Cập nhật trạng thái đơn hàng
      await conn.query(`UPDATE orders SET status = 'CANCELLED' WHERE id = ?`, [
        orderId,
      ]);

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Admin: Lấy tất cả đơn hàng
  static async getAllOrders(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    let query = `SELECT o.id, o.totalAmount, o.orderDate, o.status, o.couponId, o.shipAddress,
                        u.name as customerName, u.email,u.phoneNumber,
                        (SELECT COUNT(*) FROM orders ${
                          status ? "WHERE status = ?" : ""
                        }) as total_count
                 FROM orders o
                 JOIN users u ON o.userId = u.id`;
    const params = [];

    if (status) {
      query += ` WHERE o.status = ?`;
      params.push(status, status);
    }

    query += ` ORDER BY o.orderDate DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [orders] = await pool.query(query, params);

    // Lấy chi tiết sản phẩm cho mỗi đơn hàng
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, 
                p.name as productName, 
                p.imageUrl,
                v.name as variantName
         FROM order_items oi
         JOIN products p ON oi.productId = p.id
         LEFT JOIN variants v ON oi.variantId = v.id
         WHERE oi.orderId = ?`,
        [order.id]
      );
      order.items = items;
    }

    return orders;
  }

  // Admin: Cập nhật trạng thái đơn hàng
  // Admin: Cập nhật trạng thái đơn hàng
  static async updateOrderStatus(orderId, newStatus) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Lấy thông tin đơn hàng hiện tại
      const [order] = await conn.query(
        `SELECT status, totalAmount FROM orders WHERE id = ?`,
        [orderId]
      );

      if (order.length === 0) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      const oldStatus = order[0].status;
      const totalAmount = order[0].totalAmount;

      // Nếu chuyển từ trạng thái khác sang CANCELLED
      if (oldStatus !== "CANCELLED" && newStatus === "CANCELLED") {
        // Lấy các sản phẩm trong đơn hàng
        const [items] = await conn.query(
          `SELECT productId, quantity FROM order_items WHERE orderId = ?`,
          [orderId]
        );

        // Hoàn trả số lượng vào kho
        for (const item of items) {
          await conn.query(
            `UPDATE inventories 
           SET quantity = quantity + ? 
           WHERE productId = ?`,
            [item.quantity, item.productId]
          );
        }
      }

      // Nếu chuyển sang COMPLETED, tạo hóa đơn
      if (oldStatus !== "COMPLETED" && newStatus === "COMPLETED") {
        // Kiểm tra xem đã có hóa đơn chưa
        const [existingReceipt] = await conn.query(
          `SELECT id FROM receipts WHERE order_id = ?`,
          [orderId]
        );

        // Nếu chưa có hóa đơn thì tạo mới
        if (existingReceipt.length === 0) {
          await conn.query(
            `INSERT INTO receipts (order_id, amount, payment_method, created_at)
           VALUES (?, ?, 'CASH', NOW())`,
            [orderId, totalAmount]
          );
        }
      }

      // Cập nhật trạng thái
      await conn.query(`UPDATE orders SET status = ? WHERE id = ?`, [
        newStatus,
        orderId,
      ]);

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

export default OrderModel;
