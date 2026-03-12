import { pool } from "../config/db.js";

/**
 * Lấy user theo email (bao gồm cả soft deleted)
 */
export async function getUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ? AND deletedAt IS NULL",
    [email]
  );
  return rows[0];
}

/**
 * Lấy user theo username
 */
export async function getUserByUsername(username) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE username = ? AND deletedAt IS NULL",
    [username]
  );
  return rows[0];
}

/**
 * Tạo user mới
 */
export async function createUser({ name, email, username, password, roleId, phoneNumber, avatarUrl }) {
  // Auto-generate username từ email nếu không có
  const finalUsername = username || email.split('@')[0] + '_' + Date.now();
  
  const [result] = await pool.query(
    `INSERT INTO users (name, email, username, password, roleId, phoneNumber, avatarUrl, emailVerifiedAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
    [name, email, finalUsername, password, roleId, phoneNumber, avatarUrl || null]
  );
  return result.insertId;
}

/**
 * Lấy thông tin user theo id (không bao gồm soft deleted)
 */
export async function getUserById(id) {
  const [rows] = await pool.query(
    `SELECT id, email, username, name, phoneNumber, avatarUrl, roleId, isActive, 
            createdAt, updatedAt, lastLoginAt, emailVerifiedAt, deletedAt
     FROM users 
     WHERE id = ? AND deletedAt IS NULL`,
    [id]
  );
  return rows[0];
}

/**
 * Cập nhật thông tin user
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
    const [result] = await pool.query("UPDATE users SET password = ? WHERE id = ?", [
        newPassword,id]);
    return result.affectedRows > 0;
}

 

/**
 * Update lastLoginAt khi user login
 */
export async function updateLastLogin(userId) {
  await pool.query(
    "UPDATE users SET lastLoginAt = NOW() WHERE id = ?",
    [userId]
  );
}
username, u.phoneNumber, u.avatarUrl,
                u.isActive, u.roleId, u.createdAt, u.lastLoginAt,
                r.code as roleCode, r.name as roleName
         FROM users u 
         JOIN roles r ON u.roleId = r.id 
         WHERE u.deletedAt IS NULL
         ORDER BY u.createdAt DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
    );
    const [countResult] = await pool.query(
        "SELECT COUNT(*) as count FROM users WHERE deletedAt IS NULL"
    
    "UPDATE users SET deletedAt = NOW(), isActive = 0 WHERE id = ?",
    [userId]
  );
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
}       id,
    ]);
    return result.affectedRows > 0;
}

/**
 * Lấy danh sách tất cả users với phân trang (admin only)
 */
export async function getAllUsers(page, limit) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
        `SELECT u.id, u.name, u.email, u.isActive, u.roleId, r.name as roleName
         FROM users u JOIN roles r ON u.roleId = r.id 
         LIMIT ? OFFSET ?`,
        [limit, offset]
    );
    const [countResult] = await pool.query("SELECT COUNT(*) as count FROM users");
    const total = countResult[0].count;
    return {
        users: rows,
        pagination: {
            total,
            page,
            limit,
        },
    };
}