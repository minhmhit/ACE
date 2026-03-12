import { pool } from "../config/db.js";

/**
 * Lấy position theo id
 */
export async function getById(id) {
  const [rows] = await pool.query("SELECT * FROM positions WHERE id = ?", [id]);
  return rows[0];
}

/**
 * Lấy position theo code
 */
export async function getByCode(code) {
  const [rows] = await pool.query("SELECT * FROM positions WHERE code = ?", [
    code,
  ]);
  return rows[0];
}

/**
 * Lấy danh sách positions với search, filter, phân trang
 */
export async function getAll({ page, limit, search, isActive }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (isActive !== null && isActive !== undefined) {
    conditions.push("is_active = ?");
    params.push(isActive ? 1 : 0);
  }

  if (search) {
    conditions.push("(name LIKE ? OR code LIKE ?)");
    const term = `%${search}%`;
    params.push(term, term);
  }

  const whereClause =
    conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  const [rows] = await pool.query(
    `SELECT * FROM positions
     ${whereClause}
     ORDER BY level_no ASC, created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count FROM positions ${whereClause}`,
    params,
  );

  return {
    positions: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}

/**
 * Tạo position mới
 */
export async function create({ code, name, description, levelNo }) {
  const [result] = await pool.query(
    `INSERT INTO positions (code, name, description, level_no)
     VALUES (?, ?, ?, ?)`,
    [code, name, description || null, levelNo || null],
  );
  return result.insertId;
}

/**
 * Cập nhật position
 */
export async function update(id, data) {
  const fields = [];
  const params = [];

  if (data.code !== undefined) {
    fields.push("code = ?");
    params.push(data.code);
  }
  if (data.name !== undefined) {
    fields.push("name = ?");
    params.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push("description = ?");
    params.push(data.description);
  }
  if (data.levelNo !== undefined) {
    fields.push("level_no = ?");
    params.push(data.levelNo);
  }
  if (data.isActive !== undefined) {
    fields.push("is_active = ?");
    params.push(data.isActive ? 1 : 0);
  }

  if (fields.length === 0) return false;

  params.push(id);
  const [result] = await pool.query(
    `UPDATE positions SET ${fields.join(", ")} WHERE id = ?`,
    params,
  );
  return result.affectedRows > 0;
}

/**
 * Kiểm tra code đã tồn tại chưa
 */
export async function isCodeExists(code, excludeId = null) {
  const query = excludeId
    ? "SELECT id FROM positions WHERE code = ? AND id != ?"
    : "SELECT id FROM positions WHERE code = ?";
  const params = excludeId ? [code, excludeId] : [code];
  const [rows] = await pool.query(query, params);
  return rows.length > 0;
}

/**
 * Đếm số nhân viên đang giữ position này (qua employee_position_history)
 */
export async function countActiveEmployees(positionId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM employee_position_history
     WHERE position_id = ? AND end_date IS NULL`,
    [positionId],
  );
  return rows[0].count;
}
