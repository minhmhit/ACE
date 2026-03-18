import { pool } from "../config/db.js";

// ============================================
// Truy vấn bảng resignation_requests
// ============================================

/**
 * Lấy resignation request theo id (JOIN employee, user, approver)
 */
export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT rr.*,
            e.employee_code, e.department_id, e.status as employee_status,
            u.name as employee_name, u.email as employee_email,
            d.name as department_name,
            approver.employee_code as approver_code,
            approver_u.name as approver_name
     FROM resignation_requests rr
     JOIN employees e ON rr.employee_id = e.id
     JOIN users u ON e.user_id = u.id
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN employees approver ON rr.approved_by_employee_id = approver.id
     LEFT JOIN users approver_u ON approver.user_id = approver_u.id
     WHERE rr.id = ?`,
    [id],
  );

  return rows[0];
}

/**
 * Lấy danh sách đơn nghỉ việc của 1 nhân viên (phân trang, filter theo status)
 */
export async function getByEmployeeId({ employeeId, status, page, limit }) {
  const offset = (page - 1) * limit;
  const conditions = ["rr.employee_id = ?"];
  const params = [employeeId];

  if (status) {
    conditions.push("rr.status = ?");
    params.push(status);
  }

  const whereClause = "WHERE " + conditions.join(" AND ");

  const [rows] = await pool.query(
    `SELECT rr.*,
            approver.employee_code as approver_code,
            approver_u.name as approver_name,
            e.employee_code, e.department_id, e.status as employee_status,
            u.name as employee_name, u.email as employee_email,
            d.name as department_name
     FROM resignation_requests rr
     LEFT JOIN employees e ON rr.employee_id = e.id
     LEFT JOIN users u ON e.user_id = u.id
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN employees approver ON rr.approved_by_employee_id = approver.id
     LEFT JOIN users approver_u ON approver.user_id = approver_u.id
     ${whereClause}
     ORDER BY rr.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count FROM resignation_requests rr ${whereClause}`,
    params,
  );

  return {
    resignationRequests: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}

/**
 * Lấy tất cả đơn PENDING — dành cho ADMIN/HRM
 */
export async function getAllPending({ page, limit }) {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT rr.*,
            e.employee_code, e.department_id,
            u.name as employee_name, u.email as employee_email,
            d.name as department_name
     FROM resignation_requests rr
     JOIN employees e ON rr.employee_id = e.id
     JOIN users u ON e.user_id = u.id
     LEFT JOIN departments d ON e.department_id = d.id
     WHERE rr.status = 'PENDING'
     ORDER BY rr.created_at ASC
     LIMIT ? OFFSET ?`,
    [limit, offset],
  );

  const [countResult] = await pool.query(
    "SELECT COUNT(*) as count FROM resignation_requests WHERE status = 'PENDING'",
  );

  return {
    resignationRequests: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}

/**
 * Kiểm tra nhân viên có đơn PENDING chưa
 */
export async function hasPendingByEmployeeId(employeeId) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM resignation_requests WHERE employee_id = ? AND status = 'PENDING'",
    [employeeId],
  );
  return rows[0].count > 0;
}

/**
 * Tạo đơn nghỉ việc mới
 */
export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO resignation_requests
       (employee_id, desired_last_working_date, reason)
     VALUES (?, ?, ?)`,
    [data.employeeId, data.desiredLastWorkingDate, data.reason || null],
  );
  return result.insertId;
}

/**
 * Cập nhật status đơn nghỉ việc (dùng connection nếu trong transaction)
 */
export async function updateStatus(connOrPool, id, data) {
  const fields = ["status = ?"];
  const params = [data.status];

  if (data.approvedByEmployeeId !== undefined) {
    fields.push("approved_by_employee_id = ?");
    params.push(data.approvedByEmployeeId);
  }

  if (data.approvedAt !== undefined) {
    fields.push("approved_at = ?");
    params.push(data.approvedAt);
  }

  if (data.rejectedReason !== undefined) {
    fields.push("rejected_reason = ?");
    params.push(data.rejectedReason);
  }

  params.push(id);
  const [result] = await connOrPool.query(
    `UPDATE resignation_requests SET ${fields.join(", ")} WHERE id = ?`,
    params,
  );
  return result.affectedRows > 0;
}

/**
 * Cập nhật employee status + termination_date (trong transaction)
 */
export async function updateEmployeeOnApproval(conn, employeeId, data) {
  const [result] = await conn.query(
    `UPDATE employees SET status = ?, termination_date = ? WHERE id = ?`,
    [data.status, data.terminationDate, employeeId],
  );
  return result.affectedRows > 0;
}

/**
 * Vô hiệu hoá tài khoản user (trong transaction)
 */
export async function deactivateUser(conn, userId) {
  const [result] = await conn.query(
    "UPDATE users SET isActive = 0 WHERE id = ?",
    [userId],
  );
  return result.affectedRows > 0;
}

/**
 * Revoke tất cả sessions của user (trong transaction)
 */
export async function revokeAllSessions(conn, userId, reason) {
  await conn.query(
    `UPDATE sessions
     SET revoked_at = NOW(), revoke_reason = ?
     WHERE user_id = ? AND revoked_at IS NULL`,
    [reason, userId],
  );
}
