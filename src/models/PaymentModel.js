import { pool } from "../config/db.js";

// ============================================
// Truy vấn bảng payments + payment details
// ============================================

/**
 * Lấy payment theo id (JOIN method + ewallet/bank/card details)
 */
export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT p.*,
            pm.code as payment_method_code, pm.name as payment_method_name,
            o.totalAmount as order_total, o.status as order_status, o.userId as order_user_id,
            ew.provider as ewallet_provider, ew.transaction_id as ewallet_transaction_id,
            ew.response_code as ewallet_response_code, ew.paid_at as ewallet_paid_at,
            bt.bank_name as bank_transfer_bank, bt.account_number as bank_transfer_account,
            bt.transfer_reference as bank_transfer_reference,
            cd.card_type, cd.last_4_digits, cd.card_holder_name, cd.bank_name as card_bank_name
     FROM payments p
     JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
     JOIN orders o ON p.order_id = o.id
     LEFT JOIN payment_ewallet_details ew ON p.payment_id = ew.payment_id
     LEFT JOIN payment_bank_transfer_details bt ON p.payment_id = bt.payment_id
     LEFT JOIN payment_card_details cd ON p.payment_id = cd.payment_id
     WHERE p.payment_id = ?`,
    [id],
  );
  return rows[0];
}

/**
 * Lấy payment mới nhất theo order_id
 */
export async function getByOrderId(orderId) {
  const [rows] = await pool.query(
    `SELECT p.*,
            pm.code as payment_method_code, pm.name as payment_method_name,
            ew.provider as ewallet_provider, ew.transaction_id as ewallet_transaction_id,
            ew.response_code as ewallet_response_code, ew.paid_at as ewallet_paid_at,
            bt.bank_name as bank_transfer_bank, bt.account_number as bank_transfer_account,
            bt.transfer_reference as bank_transfer_reference,
            cd.card_type, cd.last_4_digits, cd.card_holder_name, cd.bank_name as card_bank_name
     FROM payments p
     JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
     LEFT JOIN payment_ewallet_details ew ON p.payment_id = ew.payment_id
     LEFT JOIN payment_bank_transfer_details bt ON p.payment_id = bt.payment_id
     LEFT JOIN payment_card_details cd ON p.payment_id = cd.payment_id
     WHERE p.order_id = ?
     ORDER BY p.created_at DESC
     LIMIT 1`,
    [orderId],
  );
  return rows[0];
}

/**
 * Lấy payment method theo code
 */
export async function getPaymentMethodByCode(code) {
  const [rows] = await pool.query(
    "SELECT * FROM payment_methods WHERE code = ? AND is_active = 1",
    [code],
  );
  return rows[0];
}

/**
 * Lấy tất cả payment methods active
 */
export async function getAllPaymentMethods() {
  const [rows] = await pool.query(
    "SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY payment_method_id",
  );
  return rows;
}

/**
 * Lấy order theo id
 */
export async function getOrderById(orderId) {
  const [rows] = await pool.query(
    "SELECT id, userId, totalAmount, status, shipAddress, orderDate, couponId FROM orders WHERE id = ?",
    [orderId],
  );
  return rows[0];
}

/**
 * Tạo payment (dùng trong transaction, nhận connection)
 */
export async function create(conn, data) {
  const [result] = await conn.query(
    `INSERT INTO payments (order_id, payment_method_id, amount, currency, status)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.orderId,
      data.paymentMethodId,
      data.amount,
      data.currency || "VND",
      data.status || "PENDING",
    ],
  );
  return result.insertId;
}

/**
 * Tạo ewallet details (trong transaction)
 */
export async function createEwalletDetails(conn, paymentId, data) {
  await conn.query(
    `INSERT INTO payment_ewallet_details (payment_id, provider, transaction_id, response_code, paid_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      paymentId,
      data.provider,
      data.transactionId || null,
      data.responseCode || null,
      data.paidAt || null,
    ],
  );
}

/**
 * Tạo bank transfer details (trong transaction)
 */
export async function createBankTransferDetails(conn, paymentId, data) {
  await conn.query(
    `INSERT INTO payment_bank_transfer_details (payment_id, bank_name, account_number, transfer_reference)
     VALUES (?, ?, ?, ?)`,
    [
      paymentId,
      data.bankName || null,
      data.accountNumber || null,
      data.transferReference || null,
    ],
  );
}

/**
 * Tạo card details (trong transaction)
 */
export async function createCardDetails(conn, paymentId, data) {
  await conn.query(
    `INSERT INTO payment_card_details (payment_id, card_type, last_4_digits, card_holder_name, bank_name)
     VALUES (?, ?, ?, ?, ?)`,
    [
      paymentId,
      data.cardType || null,
      data.last4Digits || null,
      data.cardHolderName || null,
      data.bankName || null,
    ],
  );
}

/**
 * Cập nhật status payment
 */
export async function updateStatus(id, status) {
  const [result] = await pool.query(
    "UPDATE payments SET status = ? WHERE payment_id = ?",
    [status, id],
  );
  return result.affectedRows > 0;
}

/**
 * Cập nhật status payment (trong transaction)
 */
export async function updateStatusConn(conn, id, status) {
  const [result] = await conn.query(
    "UPDATE payments SET status = ? WHERE payment_id = ?",
    [status, id],
  );
  return result.affectedRows > 0;
}

/**
 * Cập nhật order status (trong transaction)
 */
export async function updateOrderStatusConn(conn, orderId, status) {
  const [result] = await conn.query(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, orderId],
  );
  return result.affectedRows > 0;
}

/**
 * Cập nhật ewallet details (transaction_id, response_code khi callback)
 */
export async function updateEwalletDetails(
  paymentId,
  transactionId,
  responseCode,
) {
  const [result] = await pool.query(
    `UPDATE payment_ewallet_details
     SET transaction_id = ?, response_code = ?, paid_at = NOW()
     WHERE payment_id = ?`,
    [transactionId, responseCode, paymentId],
  );
  return result.affectedRows > 0;
}

/**
 * Lấy lịch sử thanh toán của user (phân trang)
 */
export async function getByUserId({ userId, page, limit }) {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT p.payment_id, p.order_id, p.amount, p.currency, p.status, p.created_at,
            pm.code as payment_method_code, pm.name as payment_method_name,
            o.orderDate, o.status as order_status
     FROM payments p
     JOIN orders o ON p.order_id = o.id
     JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
     WHERE o.userId = ?
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count
     FROM payments p JOIN orders o ON p.order_id = o.id
     WHERE o.userId = ?`,
    [userId],
  );

  return {
    payments: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}

/**
 * Lấy danh sách payments (admin, phân trang + filter)
 */
export async function getAll({ status, paymentMethodCode, page, limit }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("p.status = ?");
    params.push(status);
  }
  if (paymentMethodCode) {
    conditions.push("pm.code = ?");
    params.push(paymentMethodCode);
  }

  const whereClause =
    conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  const [rows] = await pool.query(
    `SELECT p.payment_id, p.order_id, p.amount, p.currency, p.status, p.created_at,
            pm.code as payment_method_code, pm.name as payment_method_name,
            o.userId as order_user_id, o.status as order_status
     FROM payments p
     JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
     JOIN orders o ON p.order_id = o.id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count
     FROM payments p
     JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
     ${whereClause}`,
    params,
  );

  return {
    payments: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}
