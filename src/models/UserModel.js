import { pool } from "../config/db.js";

/**
 * Lấy user theo email
 */
export async function getUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
}

/**
 * Tạo user mới
 */
export async function createUser({ name, email, password, roleId, phoneNumber }) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password, roleId, phoneNumber) VALUES (?, ?, ?, ?, ?)",
    [name, email, password, roleId, phoneNumber]
  );
  return result.insertId;
}

/**
 * Lấy thông tin user theo id
 */
export async function getUserById(id) {
  const [rows] = await pool.query(
    "SELECT id, email, name, phoneNumber, roleId, isActive FROM users WHERE id = ?",
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
        newPassword,
        id,
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