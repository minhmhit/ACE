import { pool } from "../config/db.js";

// ============================================
// Truy vấn bảng attendance
// ============================================

/**
 * Lấy attendance theo id (JOIN employee, user, department)
 */
export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT a.*,
            e.employee_code, e.department_id,
            u.name as employee_name,
            d.name as department_name
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     JOIN users u ON e.user_id = u.id
     LEFT JOIN departments d ON e.department_id = d.id
     WHERE a.id = ?`,
    [id],
  );
  return rows[0];
}

/**
 * Lấy attendance theo employee_id + work_date (unique key)
 */
export async function getByEmployeeAndDate(employeeId, workDate) {
  const [rows] = await pool.query(
    "SELECT * FROM attendance WHERE employee_id = ? AND work_date = ?",
    [employeeId, workDate],
  );
  return rows[0];
}

/**
 * Lấy danh sách attendance theo employee trong 1 tháng
 */
export async function getByEmployeeMonth({ employeeId, month, year }) {
  const [rows] = await pool.query(
    `SELECT a.*,
            e.employee_code,
            u.name as employee_name
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     JOIN users u ON e.user_id = u.id
     WHERE a.employee_id = ?
       AND MONTH(a.work_date) = ?
       AND YEAR(a.work_date) = ?
     ORDER BY a.work_date ASC`,
    [employeeId, month, year],
  );
  return rows;
}

/**
 * Lấy danh sách attendance cho ADMIN/HRM (filter theo month/year, tuỳ chọn employeeId)
 */
export async function getAll({ month, year, employeeId, page, limit }) {
  const offset = (page - 1) * limit;
  const conditions = ["MONTH(a.work_date) = ?", "YEAR(a.work_date) = ?"];
  const params = [month, year];

  if (employeeId) {
    conditions.push("a.employee_id = ?");
    params.push(employeeId);
  }

  const whereClause = "WHERE " + conditions.join(" AND ");

  const [rows] = await pool.query(
    `SELECT a.*,
            e.employee_code, e.department_id,
            u.name as employee_name,
            d.name as department_name
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     JOIN users u ON e.user_id = u.id
     LEFT JOIN departments d ON e.department_id = d.id
     ${whereClause}
     ORDER BY a.work_date ASC, e.employee_code ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count
     FROM attendance a
     ${whereClause}`,
    params,
  );

  return {
    attendances: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}

/**
 * Tạo bản ghi attendance (check-in hoặc manual)
 */
export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO attendance
       (employee_id, work_date, check_in, check_out, work_minutes, overtime_minutes, status, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.employeeId,
      data.workDate,
      data.checkIn || null,
      data.checkOut || null,
      data.workMinutes || 0,
      data.overtimeMinutes || 0,
      data.status,
      data.note || null,
    ],
  );
  return result.insertId;
}

/**
 * Cập nhật attendance (check-out hoặc admin edit)
 */
export async function update(id, data) {
  const fields = [];
  const params = [];

  const fieldMap = {
    checkIn: "check_in",
    checkOut: "check_out",
    workMinutes: "work_minutes",
    overtimeMinutes: "overtime_minutes",
    status: "status",
    note: "note",
  };

  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (data[camel] !== undefined) {
      fields.push(`${snake} = ?`);
      params.push(data[camel]);
    }
  }

  if (fields.length === 0) return false;

  params.push(id);
  const [result] = await pool.query(
    `UPDATE attendance SET ${fields.join(", ")} WHERE id = ?`,
    params,
  );
  return result.affectedRows > 0;
}
