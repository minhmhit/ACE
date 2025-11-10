import { pool } from "../config/db.js";

/**
 * Lấy user theo email
 */
export async function getUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT id, email, name, roleId, isActive FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
}

/**
 * Tạo user mới
 */
export async function createUser({ name, email, password, roleId }) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password, roleId) VALUES (?, ?, ?, ?)",
    [name, email, password, roleId]
  );
  return result.insertId;
}

/**
 * Lấy thông tin user theo id
 */
export async function getUserById(id) {
  const [rows] = await pool.query(
    "SELECT id, email, name, roleId, isActive FROM users WHERE id = ?",
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
