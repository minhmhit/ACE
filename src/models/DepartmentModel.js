import { pool } from "../config/db.js";

/**
 * Lấy department theo id
 */
export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT d.*, e.employee_code as managerCode,
            u.name as managerName
     FROM departments d
     LEFT JOIN employees e ON d.manager_employee_id = e.id
     LEFT JOIN users u ON e.user_id = u.id
     WHERE d.id = ?`,
    [id],
  );
  return rows[0];
}

/**
 * Lấy department theo code
 */
export async function getByCode(code) {
  const [rows] = await pool.query("SELECT * FROM departments WHERE code = ?", [
    code,
  ]);
  return rows[0];
}

/**
 * Lấy danh sách departments với search, filter, phân trang
 */
export async function getAll({ page, limit, search, isActive }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (isActive !== null && isActive !== undefined) {
    conditions.push("d.is_active = ?");
    params.push(isActive ? 1 : 0);
  }

  if (search) {
    conditions.push("(d.name LIKE ? OR d.code LIKE ?)");
    const term = `%${search}%`;
    params.push(term, term);
  }

  const whereClause =
    conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  const [rows] = await pool.query(
    `SELECT d.*, e.employee_code as managerCode,
            u.name as managerName
     FROM departments d
     LEFT JOIN employees e ON d.manager_employee_id = e.id
     LEFT JOIN users u ON e.user_id = u.id
     ${whereClause}
     ORDER BY d.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count FROM departments d ${whereClause}`,
    params,
  );

  return {
    departments: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}

/**
 * Tạo department mới
 */
export async function create({ code, name, description, managerEmployeeId }) {
  const [result] = await pool.query(
    `INSERT INTO departments (code, name, description, manager_employee_id)
     VALUES (?, ?, ?, ?)`,
    [code, name, description || null, managerEmployeeId || null],
  );
  return result.insertId;
}

/**
 * Cập nhật department
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
  if (data.managerEmployeeId !== undefined) {
    fields.push("manager_employee_id = ?");
    params.push(data.managerEmployeeId);
  }
  if (data.isActive !== undefined) {
    fields.push("is_active = ?");
    params.push(data.isActive ? 1 : 0);
  }

  if (fields.length === 0) return false;

  params.push(id);
  const [result] = await pool.query(
    `UPDATE departments SET ${fields.join(", ")} WHERE id = ?`,
    params,
  );
  return result.affectedRows > 0;
}

/**
 * Kiểm tra code đã tồn tại chưa
 */
export async function isCodeExists(code, excludeId = null) {
  const query = excludeId
    ? "SELECT id FROM departments WHERE code = ? AND id != ?"
    : "SELECT id FROM departments WHERE code = ?";
  const params = excludeId ? [code, excludeId] : [code];
  const [rows] = await pool.query(query, params);
  return rows.length > 0;
}

/**
 * Đếm số nhân viên thuộc department
 */
export async function countEmployees(departmentId) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM employees WHERE department_id = ? AND status != 'RESIGNED' AND status != 'TERMINATED'",
    [departmentId],
  );
  return rows[0].count;
}
