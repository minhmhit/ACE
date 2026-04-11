import { pool } from "../config/db.js";

// ============================================
// QUERIES DÙNG CHUNG (Auth + User module)
// ============================================

/**
 * Lấy user theo email (bao gồm password, dùng cho login)
 */
export async function getUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ? AND deletedAt IS NULL",
    [email],
  );
  return rows[0];
}

/**
 * Lấy user theo username (bao gồm password, dùng cho login)
 */
export async function getUserByUsername(username) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE username = ? AND deletedAt IS NULL",
    [username],
  );
  return rows[0];
}

/**
 * Lấy thông tin user theo id (không trả password, không bao gồm soft deleted)
 */
export async function getUserById(id) {
  const [rows] = await pool.query(
    `SELECT id, email, username, name, phoneNumber, avatarUrl, roleId, isActive,
            createdAt, updatedAt, lastLoginAt, emailVerifiedAt
     FROM users
     WHERE id = ? AND deletedAt IS NULL`,
    [id],
  );
  return rows[0];
}

/**
 * Tạo user mới
 */
export async function createUser({
  name,
  email,
  username,
  password,
  roleId,
  phoneNumber,
  avatarUrl,
}) {
  const finalUsername = username || email.split("@")[0] + "_" + Date.now();

  const [result] = await pool.query(
    `INSERT INTO users (name, email, username, password, roleId, phoneNumber, avatarUrl)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      email,
      finalUsername,
      password,
      roleId,
      phoneNumber || null,
      avatarUrl || null,
    ],
  );
  return result.insertId;
}

/**
 * Cập nhật thông tin user (generic update)
 */
export async function updateUser(id, data) {
  const [result] = await pool.query("UPDATE users SET ? WHERE id = ?", [
    data,
    id,
  ]);
  return result.affectedRows > 0;
}

/**
 * Update user password
 */
export async function updatePassword(id, newPassword) {
  const [result] = await pool.query(
    "UPDATE users SET password = ? WHERE id = ?",
    [newPassword, id],
  );
  return result.affectedRows > 0;
}

/**
 * Update lastLoginAt khi user login
 */
export async function updateLastLogin(userId) {
  await pool.query("UPDATE users SET lastLoginAt = NOW() WHERE id = ?", [
    userId,
  ]);
}

/**
 * Kiểm tra email đã tồn tại chưa
 */
export async function isEmailExists(email, excludeUserId = null) {
  const query = excludeUserId
    ? "SELECT id FROM users WHERE email = ? AND id != ? AND deletedAt IS NULL"
    : "SELECT id FROM users WHERE email = ? AND deletedAt IS NULL";
  const params = excludeUserId ? [email, excludeUserId] : [email];
  const [rows] = await pool.query(query, params);
  return rows.length > 0;
}

/**
 * Kiểm tra username đã tồn tại chưa
 */
export async function isUsernameExists(username, excludeUserId = null) {
  const query = excludeUserId
    ? "SELECT id FROM users WHERE username = ? AND id != ? AND deletedAt IS NULL"
    : "SELECT id FROM users WHERE username = ? AND deletedAt IS NULL";
  const params = excludeUserId ? [username, excludeUserId] : [username];
  const [rows] = await pool.query(query, params);
  return rows.length > 0;
}

// ============================================
// ADMIN QUERIES
// ============================================

/**
 * Lấy user theo id bao gồm cả soft deleted (admin only)
 */
export async function getUserByIdAdmin(id) {
  const [rows] = await pool.query(
    `SELECT u.id, u.email, u.username, u.name, u.phoneNumber, u.avatarUrl,
            u.isActive, u.roleId, u.createdAt, u.updatedAt,
            u.lastLoginAt, u.emailVerifiedAt, u.deletedAt,
            r.code as roleCode, r.name as roleName
     FROM users u
     JOIN roles r ON u.roleId = r.id
     WHERE u.id = ?`,
    [id],
  );
  return rows[0];
}

/**
 * Lấy danh sách users với search, filter, phân trang (admin only)
 */
export async function getAllUsersAdmin({
  page,
  limit,
  search,
  roleId,
  isActive,
  includeDeleted,
}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (!includeDeleted) {
    conditions.push("u.deletedAt IS NULL");
  }

  if (search) {
    conditions.push("(u.name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)");
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (roleId) {
    conditions.push("u.roleId = ?");
    params.push(roleId);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push("u.isActive = ?");
    params.push(isActive ? 1 : 0);
  }

  const whereClause =
    conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.username, u.phoneNumber, u.avatarUrl,
            u.isActive, u.roleId, u.createdAt, u.updatedAt,
            u.lastLoginAt, u.emailVerifiedAt, u.deletedAt,
            r.code as roleCode, r.name as roleName
     FROM users u
     JOIN roles r ON u.roleId = r.id
     ${whereClause}
     ORDER BY u.createdAt DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count FROM users u ${whereClause}`,
    params,
  );

  const total = countResult[0].count;
  return {
    users: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Soft delete user
 */
export async function softDeleteUser(userId) {
  const [result] = await pool.query(
    "UPDATE users SET deletedAt = NOW(), isActive = 0 WHERE id = ?",
    [userId],
  );
  return result.affectedRows > 0;
}

/**
 * Toggle active status
 */
export async function toggleActive(userId, isActive) {
  const [result] = await pool.query(
    "UPDATE users SET isActive = ? WHERE id = ?",
    [isActive ? 1 : 0, userId],
  );
  return result.affectedRows > 0;
}

// ============================================
// ADDRESS QUERIES (Profile + Address module)
// ============================================

export async function getAddressesByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT id, user_id, receiver_name, phone_number, full_address, is_default,
            address_type, created_at, update_at
     FROM addresses
     WHERE user_id = ?
     ORDER BY is_default DESC, created_at DESC`,
    [userId],
  );
  return rows;
}

export async function getDefaultAddressByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT id, user_id, receiver_name, phone_number, full_address, is_default,
            address_type, created_at, update_at
     FROM addresses
     WHERE user_id = ? AND is_default = 1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId],
  );
  return rows[0];
}

export async function getAddressByIdAndUserId(addressId, userId) {
  const [rows] = await pool.query(
    `SELECT id, user_id, receiver_name, phone_number, full_address, is_default,
            address_type, created_at, update_at
     FROM addresses
     WHERE id = ? AND user_id = ?`,
    [addressId, userId],
  );
  return rows[0];
}

export async function countAddressesByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM addresses WHERE user_id = ?`,
    [userId],
  );
  return rows[0]?.count || 0;
}

export async function clearDefaultAddresses(conn, userId) {
  await conn.query(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`, [
    userId,
  ]);
}

export async function createAddress(conn, data) {
  const [result] = await conn.query(
    `INSERT INTO addresses
      (user_id, receiver_name, phone_number, full_address, is_default, address_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.userId,
      data.receiverName,
      data.phoneNumber,
      data.fullAddress,
      data.isDefault ? 1 : 0,
      data.addressType || "home",
    ],
  );

  const [rows] = await conn.query(
    `SELECT id, user_id, receiver_name, phone_number, full_address, is_default,
            address_type, created_at, update_at
     FROM addresses
     WHERE id = ?`,
    [result.insertId],
  );

  return rows[0];
}

export async function updateAddress(conn, addressId, userId, data) {
  await conn.query(
    `UPDATE addresses
     SET receiver_name = ?,
         phone_number = ?,
         full_address = ?,
         address_type = ?,
         is_default = ?,
         update_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    [
      data.receiverName,
      data.phoneNumber,
      data.fullAddress,
      data.addressType || "home",
      data.isDefault ? 1 : 0,
      addressId,
      userId,
    ],
  );

  const [rows] = await conn.query(
    `SELECT id, user_id, receiver_name, phone_number, full_address, is_default,
            address_type, created_at, update_at
     FROM addresses
     WHERE id = ? AND user_id = ?`,
    [addressId, userId],
  );

  return rows[0];
}

export async function deleteAddress(addressId, userId) {
  const [result] = await pool.query(
    `DELETE FROM addresses WHERE id = ? AND user_id = ?`,
    [addressId, userId],
  );
  return result.affectedRows > 0;
}
