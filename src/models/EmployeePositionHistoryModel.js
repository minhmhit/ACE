import { pool } from "../config/db.js";

// ============================================
// Truy vấn bảng employee_position_history
// ============================================

/**
 * Lấy lịch sử chức vụ theo employee_id (mới nhất trước)
 */
export async function getByEmployeeId(employeeId) {
  const [rows] = await pool.query(
    `SELECT eph.*,
            p.code as position_code, p.name as position_name,
            d.code as department_code, d.name as department_name,
            u.name as changed_by_name
     FROM employee_position_history eph
     JOIN positions p ON eph.position_id = p.id
     LEFT JOIN departments d ON eph.department_id = d.id
     LEFT JOIN users u ON eph.changed_by_user_id = u.id
     WHERE eph.employee_id = ?
     ORDER BY eph.effective_from DESC`,
    [employeeId],
  );
  return rows;
}

/**
 * Lấy bản ghi position hiện tại (effective_to IS NULL)
 */
export async function getCurrentByEmployeeId(employeeId) {
  const [rows] = await pool.query(
    `SELECT eph.*,
            p.code as position_code, p.name as position_name,
            d.code as department_code, d.name as department_name
     FROM employee_position_history eph
     JOIN positions p ON eph.position_id = p.id
     LEFT JOIN departments d ON eph.department_id = d.id
     WHERE eph.employee_id = ? AND eph.effective_to IS NULL`,
    [employeeId],
  );
  return rows[0];
}

/**
 * Lấy position của nhân viên tại 1 thời điểm cụ thể (phục vụ payroll)
 */
export async function getAtDate(employeeId, date) {
  const [rows] = await pool.query(
    `SELECT eph.*,
            p.code as position_code, p.name as position_name,
            d.code as department_code, d.name as department_name
     FROM employee_position_history eph
     JOIN positions p ON eph.position_id = p.id
     LEFT JOIN departments d ON eph.department_id = d.id
     WHERE eph.employee_id = ?
       AND eph.effective_from <= ?
       AND (eph.effective_to IS NULL OR eph.effective_to > ?)
     ORDER BY eph.effective_from DESC
     LIMIT 1`,
    [employeeId, date, date],
  );
  return rows[0];
}

/**
 * Kiểm tra chồng lấn thời gian (dùng trong transaction, nhận connection)
 * Trả về true nếu CÓ chồng lấn
 */
export async function hasOverlap(
  conn,
  employeeId,
  effectiveFrom,
  effectiveTo,
  excludeId = null,
) {
  const params = [employeeId];
  let excludeClause = "";
  if (excludeId) {
    excludeClause = "AND eph.id != ?";
    params.push(excludeId);
  }

  // effectiveTo = null → open-ended → dùng far future
  const endDate = effectiveTo || "9999-12-31 23:59:59";
  params.push(endDate, effectiveFrom);

  const [rows] = await conn.query(
    `SELECT COUNT(*) as count
     FROM employee_position_history eph
     WHERE eph.employee_id = ?
       ${excludeClause}
       AND eph.effective_from < ?
       AND (eph.effective_to IS NULL OR eph.effective_to > ?)`,
    params,
  );
  return rows[0].count > 0;
}

/**
 * Tạo bản ghi position history mới (dùng trong transaction, nhận connection)
 */
export async function create(conn, data) {
  const [result] = await conn.query(
    `INSERT INTO employee_position_history
       (employee_id, position_id, department_id, effective_from, effective_to,
        base_salary, allowance_amount, salary_type, note, changed_reason, changed_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.employeeId,
      data.positionId,
      data.departmentId || null,
      data.effectiveFrom,
      data.effectiveTo || null,
      data.baseSalary,
      data.allowanceAmount || 0,
      data.salaryType || "MONTHLY",
      data.note || null,
      data.changedReason || null,
      data.changedByUserId || null,
    ],
  );
  return result.insertId;
}

/**
 * Đóng bản ghi position hiện tại (set effective_to, dùng trong transaction)
 */
export async function closeCurrent(conn, employeeId, effectiveTo) {
  const [result] = await conn.query(
    `UPDATE employee_position_history
     SET effective_to = ?
     WHERE employee_id = ? AND effective_to IS NULL`,
    [effectiveTo, employeeId],
  );
  return result.affectedRows > 0;
}
