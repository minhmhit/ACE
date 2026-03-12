import { pool } from "../config/db.js";

// ============================================
// Truy vấn bảng receipts
// ============================================

/**
 * Tạo receipt (trong transaction)
 */
export async function create(conn, data) {
  const [result] = await conn.query(
    `INSERT INTO receipts (payment_id, amount, order_id, payment_method, description)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.paymentId || null,
      data.amount,
      data.orderId,
      data.paymentMethod,
      data.description || null,
    ],
  );
  return result.insertId;
}

/**
 * Lấy receipt theo id (JOIN payment + order)
 */
export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT r.*,
            p.status as payment_status, p.currency as payment_currency,
            o.userId as order_user_id, o.status as order_status, o.orderDate
     FROM receipts r
     LEFT JOIN payments p ON r.payment_id = p.payment_id
     LEFT JOIN orders o ON r.order_id = o.id
     WHERE r.id = ?`,
    [id],
  );
  return rows[0];
}

/**
 * Lấy receipt theo payment_id
 */
export async function getByPaymentId(paymentId) {
  const [rows] = await pool.query(
    "SELECT * FROM receipts WHERE payment_id = ?",
    [paymentId],
  );
  return rows[0];
}

/**
 * Lấy receipt theo order_id
 */
export async function getByOrderId(orderId) {
  const [rows] = await pool.query(
    `SELECT r.*, p.status as payment_status
     FROM receipts r
     LEFT JOIN payments p ON r.payment_id = p.payment_id
     WHERE r.order_id = ?
     ORDER BY r.id DESC`,
    [orderId],
  );
  return rows;
}

/**
 * Lấy danh sách receipts (admin, phân trang + filter)
 */
export async function getAll({ orderId, paymentMethod, page, limit }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (orderId) {
    conditions.push("r.order_id = ?");
    params.push(orderId);
  }
  if (paymentMethod) {
    conditions.push("r.payment_method = ?");
    params.push(paymentMethod);
  }

  const whereClause =
    conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  const [rows] = await pool.query(
    `SELECT r.*, o.userId as order_user_id, o.status as order_status
     FROM receipts r
     LEFT JOIN orders o ON r.order_id = o.id
     ${whereClause}
     ORDER BY r.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count FROM receipts r ${whereClause}`,
    params,
  );

  return {
    receipts: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}
