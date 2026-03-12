import { pool } from "../config/db.js";

/**
 * Lấy role theo ID
 */
export async function getRoleById(roleId) {
  const [rows] = await pool.query(
    "SELECT * FROM roles WHERE id = ? AND isActive = 1",
    [roleId],
  );
  return rows[0];
}

/**
 * Lấy role theo code
 * @param {string} code - Role code (ADMIN, USER, WAREHOUSE, SALE, HRM)
 */
export async function getRoleByCode(code) {
  const [rows] = await pool.query(
    "SELECT * FROM roles WHERE code = ? AND isActive = 1",
    [code],
  );
  return rows[0];
}

/**
 * Lấy tất cả roles đang active
 */
export async function getAllRoles() {
  const [rows] = await pool.query(
    "SELECT id, code, name, description, isActive, createdAt, updatedAt FROM roles WHERE isActive = 1 ORDER BY id",
  );
  return rows;
}

/**
 * Kiểm tra role tồn tại và active
 */
export async function isRoleValid(roleId) {
  const role = await getRoleById(roleId);
  return !!role;
}
