import { pool } from "../config/db.js";

// ============================================
// Truy vấn bảng leave_types
// ============================================

/**
 * Lấy leave type theo id
 */
export async function getById(id) {
  const [rows] = await pool.query("SELECT * FROM leave_types WHERE id = ?", [
    id,
  ]);
  return rows[0];
}

/**
 * Lấy leave type theo code
 */
export async function getByCode(code) {
  const [rows] = await pool.query("SELECT * FROM leave_types WHERE code = ?", [
    code,
  ]);
  return rows[0];
}

/**
 * Lấy danh sách leave types (có filter isActive)
 */
export async function getAll({ isActive }) {
  const conditions = [];
  const params = [];

  if (isActive !== null && isActive !== undefined) {
    conditions.push("is_active = ?");
    params.push(isActive ? 1 : 0);
  }

  const whereClause =
    conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  const [rows] = await pool.query(
    `SELECT * FROM leave_types ${whereClause} ORDER BY id ASC`,
    params,
  );
  return rows;
}

/**
 * Tạo leave type mới
 */
export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO leave_types (code, name, is_paid, requires_attachment, max_days_per_year, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.code,
      data.name,
      data.isPaid ? 1 : 0,
      data.requiresAttachment ? 1 : 0,
      data.maxDaysPerYear || null,
      data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
    ],
  );
  return result.insertId;
}

/**
 * Cập nhật leave type
 */
export async function update(id, data) {
  const fields = [];
  const params = [];

  const fieldMap = {
    code: "code",
    name: "name",
    isPaid: "is_paid",
    requiresAttachment: "requires_attachment",
    maxDaysPerYear: "max_days_per_year",
    isActive: "is_active",
  };

  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (data[camel] !== undefined) {
      if (["isPaid", "requiresAttachment", "isActive"].includes(camel)) {
        fields.push(`${snake} = ?`);
        params.push(data[camel] ? 1 : 0);
      } else {
        fields.push(`${snake} = ?`);
        params.push(data[camel]);
      }
    }
  }

  if (fields.length === 0) return false;

  params.push(id);
  const [result] = await pool.query(
    `UPDATE leave_types SET ${fields.join(", ")} WHERE id = ?`,
    params,
  );
  return result.affectedRows > 0;
}

/**
 * Kiểm tra code đã tồn tại chưa
 */
export async function isCodeExists(code, excludeId = null) {
  const query = excludeId
    ? "SELECT id FROM leave_types WHERE code = ? AND id != ?"
    : "SELECT id FROM leave_types WHERE code = ?";
  const params = excludeId ? [code, excludeId] : [code];
  const [rows] = await pool.query(query, params);
  return rows.length > 0;
}
