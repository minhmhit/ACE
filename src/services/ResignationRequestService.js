import { pool } from "../config/db.js";
import * as ResignationRequestModel from "../models/ResignationRequestModel.js";
import * as EmployeeModel from "../models/EmployeeModel.js";

// ============================================
// STATE MACHINE
// ============================================

/**
 * PENDING → APPROVED | REJECTED | CANCELLED
 * APPROVED, REJECTED, CANCELLED → terminal
 */
const STATUS_TRANSITIONS = {
  PENDING: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
};

/**
 * Trạng thái nhân viên được phép tạo đơn nghỉ việc
 */
const ALLOWED_EMPLOYEE_STATUSES = ["ACTIVE", "ON_LEAVE"];

// ============================================
// Format response (snake_case → camelCase)
// ============================================
function formatResignationRequest(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeCode: row.employee_code || null,
    employeeName: row.employee_name || null,
    employeeEmail: row.employee_email || null,
    departmentId: row.department_id || null,
    departmentName: row.department_name || null,
    desiredLastWorkingDate: row.desired_last_working_date,
    reason: row.reason,
    status: row.status,
    approvedByEmployeeId: row.approved_by_employee_id,
    approverCode: row.approver_code || null,
    approverName: row.approver_name || null,
    approvedAt: row.approved_at,
    rejectedReason: row.rejected_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================
// Helpers
// ============================================
async function getEmployeeByUserId(userId) {
  const employee = await EmployeeModel.getByUserId(userId);
  if (!employee) {
    const error = new Error("Không tìm thấy hồ sơ nhân viên");
    error.statusCode = 404;
    throw error;
  }
  return employee;
}

// ============================================
// NHÂN VIÊN — Self-service
// ============================================

/**
 * GET /resignation-requests/me
 * Nhân viên xem danh sách đơn nghỉ việc của mình
 */
export async function getMyResignationRequests(userId, query) {
  const employee = await getEmployeeByUserId(userId);
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);

  const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
  const status = validStatuses.includes(query.status) ? query.status : null;

  const result = await ResignationRequestModel.getByEmployeeId({
    employeeId: employee.id,
    status,
    page,
    limit,
  });

  return {
    resignationRequests: result.resignationRequests.map(
      formatResignationRequest,
    ),
    pagination: result.pagination,
  };
}

/**
 * POST /resignation-requests
 * Nhân viên tạo đơn xin nghỉ việc
 *
 * Validation flow:
 *   1. Lấy employee từ userId
 *   2. Kiểm tra employee.status phải là ACTIVE hoặc ON_LEAVE
 *   3. Kiểm tra không có đơn PENDING nào đang chờ
 *   4. Validate desiredLastWorkingDate >= today
 *   5. Insert đơn mới với status = PENDING
 */
export async function createResignationRequest(userId, data) {
  const employee = await getEmployeeByUserId(userId);

  // 1. Kiểm tra trạng thái nhân viên
  if (!ALLOWED_EMPLOYEE_STATUSES.includes(employee.status)) {
    const error = new Error(
      `Nhân viên ở trạng thái "${employee.status}" không thể tạo đơn nghỉ việc. Chỉ nhân viên ACTIVE hoặc ON_LEAVE mới được phép`,
    );
    error.statusCode = 400;
    throw error;
  }

  // 2. Kiểm tra đơn PENDING đang tồn tại
  const hasPending = await ResignationRequestModel.hasPendingByEmployeeId(
    employee.id,
  );
  if (hasPending) {
    const error = new Error(
      "Bạn đã có đơn nghỉ việc đang chờ duyệt. Vui lòng huỷ đơn cũ trước khi tạo đơn mới",
    );
    error.statusCode = 409;
    throw error;
  }

  // 3. Validate ngày làm việc cuối >= hôm nay
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const desiredDate = new Date(data.desiredLastWorkingDate);
  if (desiredDate < today) {
    const error = new Error(
      "Ngày làm việc cuối cùng mong muốn phải từ hôm nay trở đi",
    );
    error.statusCode = 400;
    throw error;
  }

  // 4. Tạo đơn
  const id = await ResignationRequestModel.create({
    employeeId: employee.id,
    desiredLastWorkingDate: data.desiredLastWorkingDate,
    reason: data.reason,
  });

  const created = await ResignationRequestModel.getById(id);
  return formatResignationRequest(created);
}

/**
 * PATCH /resignation-requests/:id/cancel
 * Nhân viên tự hủy đơn (chỉ khi PENDING)
 */
export async function cancelResignationRequest(userId, requestId) {
  const employee = await getEmployeeByUserId(userId);

  const request = await ResignationRequestModel.getById(requestId);
  if (!request) {
    const error = new Error("Không tìm thấy đơn nghỉ việc");
    error.statusCode = 404;
    throw error;
  }

  // Chỉ chủ đơn mới được hủy
  if (request.employee_id !== employee.id) {
    const error = new Error("Bạn không có quyền hủy đơn này");
    error.statusCode = 403;
    throw error;
  }

  // Validate state machine: chỉ PENDING → CANCELLED
  if (request.status !== "PENDING") {
    const error = new Error(
      `Không thể hủy đơn ở trạng thái "${request.status}". Chỉ đơn PENDING mới hủy được`,
    );
    error.statusCode = 400;
    throw error;
  }

  await ResignationRequestModel.updateStatus(pool, requestId, {
    status: "CANCELLED",
  });

  const updated = await ResignationRequestModel.getById(requestId);
  return formatResignationRequest(updated);
}

// ============================================
// QUẢN LÝ / ADMIN / HRM
// ============================================

/**
 * GET /resignation-requests/pending
 * ADMIN/HRM xem đơn PENDING cần duyệt
 */
export async function getPendingRequests(query) {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);

  const result = await ResignationRequestModel.getAllPending({ page, limit });
  return {
    resignationRequests: result.resignationRequests.map(
      formatResignationRequest,
    ),
    pagination: result.pagination,
  };
}

/**
 * PATCH /resignation-requests/:id/approve
 * Duyệt đơn nghỉ việc (PENDING → APPROVED)
 *
 * Side effects (trong transaction):
 *   1. UPDATE resignation_requests.status → APPROVED
 *   2. UPDATE employees.status → RESIGNED, termination_date = desired_last_working_date
 *   3. UPDATE users.isActive → 0 (vô hiệu hoá tài khoản)
 *   4. REVOKE tất cả sessions của user (buộc đăng xuất)
 */
export async function approveResignationRequest(userId, requestId) {
  const approver = await getEmployeeByUserId(userId);

  const request = await ResignationRequestModel.getById(requestId);
  if (!request) {
    const error = new Error("Không tìm thấy đơn nghỉ việc");
    error.statusCode = 404;
    throw error;
  }

  // Validate state machine
  if (request.status !== "PENDING") {
    const error = new Error(
      `Không thể duyệt đơn ở trạng thái "${request.status}". Chỉ đơn PENDING mới duyệt được`,
    );
    error.statusCode = 400;
    throw error;
  }

  // Không tự duyệt đơn của mình
  if (request.employee_id === approver.id) {
    const error = new Error("Không thể tự duyệt đơn nghỉ việc của chính mình");
    error.statusCode = 403;
    throw error;
  }

  // Lấy thông tin employee để biết user_id
  const resigningEmployee = await EmployeeModel.getById(request.employee_id);
  if (!resigningEmployee) {
    const error = new Error("Không tìm thấy hồ sơ nhân viên nghỉ việc");
    error.statusCode = 404;
    throw error;
  }

  // === TRANSACTION: xử lý toàn bộ side effects ===
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Cập nhật trạng thái đơn → APPROVED
    await ResignationRequestModel.updateStatus(conn, requestId, {
      status: "APPROVED",
      approvedByEmployeeId: approver.id,
      approvedAt: new Date(),
    });

    // 2. Cập nhật employee → RESIGNED + termination_date
    await ResignationRequestModel.updateEmployeeOnApproval(
      conn,
      request.employee_id,
      {
        status: "RESIGNED",
        terminationDate: request.desired_last_working_date,
      },
    );

    // 3. Vô hiệu hoá tài khoản user
    await ResignationRequestModel.deactivateUser(
      conn,
      resigningEmployee.user_id,
    );

    // 4. Revoke tất cả sessions (buộc đăng xuất)
    await ResignationRequestModel.revokeAllSessions(
      conn,
      resigningEmployee.user_id,
      "Resignation approved",
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const updated = await ResignationRequestModel.getById(requestId);
  return formatResignationRequest(updated);
}

/**
 * PATCH /resignation-requests/:id/reject
 * Từ chối đơn nghỉ việc (PENDING → REJECTED)
 */
export async function rejectResignationRequest(
  userId,
  requestId,
  rejectedReason,
) {
  const approver = await getEmployeeByUserId(userId);

  const request = await ResignationRequestModel.getById(requestId);
  if (!request) {
    const error = new Error("Không tìm thấy đơn nghỉ việc");
    error.statusCode = 404;
    throw error;
  }

  // Validate state machine
  if (request.status !== "PENDING") {
    const error = new Error(
      `Không thể từ chối đơn ở trạng thái "${request.status}". Chỉ đơn PENDING mới từ chối được`,
    );
    error.statusCode = 400;
    throw error;
  }

  // Không tự từ chối đơn của mình
  if (request.employee_id === approver.id) {
    const error = new Error(
      "Không thể tự từ chối đơn nghỉ việc của chính mình",
    );
    error.statusCode = 403;
    throw error;
  }

  await ResignationRequestModel.updateStatus(pool, requestId, {
    status: "REJECTED",
    approvedByEmployeeId: approver.id,
    approvedAt: new Date(),
    rejectedReason: rejectedReason || null,
  });

  const updated = await ResignationRequestModel.getById(requestId);
  return formatResignationRequest(updated);
}
