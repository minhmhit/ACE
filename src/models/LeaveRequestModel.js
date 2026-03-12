import { pool } from "../config/db.js";

// ============================================
// Truy vấn bảng leave_requests
// ============================================

/**
 * Lấy leave request theo id (JOIN employee, leave_type, approver)
 */
export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT lr.*,
            e.employee_code, e.department_id,
            u.name as employee_name,
            lt.code as leave_type_code, lt.name as leave_type_name,
            lt.requires_attachment, lt.is_paid, lt.max_days_per_year,
            approver.employee_code as approver_code,
            approver_u.name as approver_name
     FROM leave_requests lr
     JOIN employees e ON lr.employee_id = e.id
     JOIN users u ON e.user_id = u.id
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     LEFT JOIN employees approver ON lr.approved_by_employee_id = approver.id
     LEFT JOIN users approver_u ON approver.user_id = approver_u.id
     WHERE lr.id = ?`,
    [id],
  );
  return rows[0];
}

/**
 * Lấy danh sách đơn nghỉ của 1 nhân viên (phân trang, filter theo status)
 */
export async function getByEmployeeId({ employeeId, status, page, limit }) {
  const offset = (page - 1) * limit;
  const conditions = ["lr.employee_id = ?"];
  const params = [employeeId];

  if (status) {
    conditions.push("lr.status = ?");
    params.push(status);
  }

  const whereClause = "WHERE " + conditions.join(" AND ");

  const [rows] = await pool.query(
    `SELECT lr.*,
            lt.code as leave_type_code, lt.name as leave_type_name,
            lt.is_paid,
            approver.employee_code as approver_code,
            approver_u.name as approver_name
     FROM leave_requests lr
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     LEFT JOIN employees approver ON lr.approved_by_employee_id = approver.id
     LEFT JOIN users approver_u ON approver.user_id = approver_u.id
     ${whereClause}
     ORDER BY lr.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count FROM leave_requests lr ${whereClause}`,
    params,
  );

  return {
    leaveRequests: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}

/**
 * Lấy đơn nghỉ PENDING dưới quyền quản lý (theo department hoặc direct report)
 * Manager thấy đơn PENDING của nhân viên cùng phòng ban
 */
export async function getPendingByManager({
  managerEmployeeId,
  departmentId,
  page,
  limit,
}) {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT lr.*,
            e.employee_code, e.department_id,
            u.name as employee_name,
            lt.code as leave_type_code, lt.name as leave_type_name,
            lt.is_paid
     FROM leave_requests lr
     JOIN employees e ON lr.employee_id = e.id
     JOIN users u ON e.user_id = u.id
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     WHERE lr.status = 'PENDING'
       AND (e.direct_manager_employee_id = ? OR e.department_id = ?)
       AND lr.employee_id != ?
     ORDER BY lr.created_at ASC
     LIMIT ? OFFSET ?`,
    [managerEmployeeId, departmentId, managerEmployeeId, limit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count
     FROM leave_requests lr
     JOIN employees e ON lr.employee_id = e.id
     WHERE lr.status = 'PENDING'
       AND (e.direct_manager_employee_id = ? OR e.department_id = ?)
       AND lr.employee_id != ?`,
    [managerEmployeeId, departmentId, managerEmployeeId],
  );

  return {
    leaveRequests: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}

/**
 * Lấy đơn nghỉ PENDING — dành cho ADMIN/HRM (xem tất cả)
 */
export async function getAllPending({ page, limit }) {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT lr.*,
            e.employee_code, e.department_id,
            u.name as employee_name,
            lt.code as leave_type_code, lt.name as leave_type_name,
            lt.is_paid
     FROM leave_requests lr
     JOIN employees e ON lr.employee_id = e.id
     JOIN users u ON e.user_id = u.id
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     WHERE lr.status = 'PENDING'
     ORDER BY lr.created_at ASC
     LIMIT ? OFFSET ?`,
    [limit, offset],
  );

  const [countResult] = await pool.query(
    "SELECT COUNT(*) as count FROM leave_requests WHERE status = 'PENDING'",
  );

  return {
    leaveRequests: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}

/**
 * Tạo đơn nghỉ mới
 */
export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO leave_requests
       (employee_id, leave_type_id, request_type, start_date, end_date,
        total_days, reason, attachment_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.employeeId,
      data.leaveTypeId,
      data.requestType,
      data.startDate,
      data.endDate,
      data.totalDays,
      data.reason || null,
      data.attachmentUrl || null,
    ],
  );
  return result.insertId;
}

/**
 * Cập nhật status đơn nghỉ
 */
export async function updateStatus(id, data) {
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
  const [result] = await pool.query(
    `UPDATE leave_requests SET ${fields.join(", ")} WHERE id = ?`,
    params,
  );
  return result.affectedRows > 0;
}

/**
 * Kiểm tra chồng ngày nghỉ (cùng nhân viên, chưa bị CANCELLED/REJECTED)
 */
export async function hasOverlap(
  employeeId,
  startDate,
  endDate,
  excludeId = null,
) {
  const params = [employeeId, endDate, startDate];
  let excludeClause = "";
  if (excludeId) {
    excludeClause = "AND id != ?";
    params.push(excludeId);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM leave_requests
     WHERE employee_id = ?
       AND status IN ('PENDING', 'APPROVED')
       AND start_date <= ?
       AND end_date >= ?
       ${excludeClause}`,
    params,
  );
  return rows[0].count > 0;
}

/**
 * Tính tổng số ngày nghỉ đã dùng trong năm (APPROVED) theo leave_type_id
 */
export async function getUsedDaysInYear(employeeId, leaveTypeId, year) {
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(total_days), 0) as used_days
     FROM leave_requests
     WHERE employee_id = ?
       AND leave_type_id = ?
       AND status = 'APPROVED'
       AND YEAR(start_date) = ?`,
    [employeeId, leaveTypeId, year],
  );
  return parseFloat(rows[0].used_days);
}
