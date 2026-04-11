import * as LeaveRequestModel from "../models/LeaveRequestModel.js";
import * as LeaveTypeModel from "../models/LeaveTypeModel.js";
import * as EmployeeModel from "../models/EmployeeModel.js";

// ============================================
// ENUMS & STATE MACHINE
// ============================================
const VALID_REQUEST_TYPES = [
  "ANNUAL_LEAVE",
  "SICK_LEAVE",
  "MATERNITY_LEAVE",
  "UNPAID_LEAVE",
  "OTHER",
];

const REQUEST_TYPE_ALIASES = {
  ANNUAL: "ANNUAL_LEAVE",
  ANNUAL_LEAVE: "ANNUAL_LEAVE",
  LEAVE: "ANNUAL_LEAVE",
  SICK: "SICK_LEAVE",
  SICK_LEAVE: "SICK_LEAVE",
  MATERNITY: "MATERNITY_LEAVE",
  MATERNITY_LEAVE: "MATERNITY_LEAVE",
  UNPAID: "UNPAID_LEAVE",
  UNPAID_LEAVE: "UNPAID_LEAVE",
  OTHER: "OTHER",
};

/**
 * State machine cho đơn nghỉ
 * PENDING → APPROVED | REJECTED | CANCELLED
 * APPROVED, REJECTED, CANCELLED → terminal (không chuyển tiếp)
 */
const STATUS_TRANSITIONS = {
  PENDING: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
};

// ============================================
// Format response (snake_case → camelCase)
// ============================================
function formatLeaveRequest(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeCode: row.employee_code || null,
    employeeName: row.employee_name || null,
    departmentId: row.department_id || null,
    leaveTypeId: row.leave_type_id,
    leaveTypeCode: row.leave_type_code || null,
    leaveTypeName: row.leave_type_name || null,
    isPaid: row.is_paid !== undefined ? !!row.is_paid : null,
    requestType: row.request_type,
    startDate: row.start_date,
    endDate: row.end_date,
    totalDays: row.total_days,
    reason: row.reason,
    attachmentUrl: row.attachment_url,
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

/**
 * Lấy employee từ userId, throw nếu không tìm thấy
 */
async function getEmployeeByUserId(userId) {
  const employee = await EmployeeModel.getByUserId(userId);
  if (!employee) {
    const error = new Error("Không tìm thấy hồ sơ nhân viên");
    error.statusCode = 404;
    throw error;
  }
  return employee;
}

/**
 * Tính tổng ngày nghỉ (đơn giản: endDate - startDate + 1)
 */
function calculateTotalDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return diffTime / (1000 * 60 * 60 * 24) + 1;
}

function normalizeRequestType(leaveTypeCode, requestType) {
  const normalizedLeaveTypeCode = String(leaveTypeCode || "")
    .trim()
    .toUpperCase();
  const normalizedRequestType = String(requestType || "")
    .trim()
    .toUpperCase();

  const finalRequestType =
    REQUEST_TYPE_ALIASES[normalizedLeaveTypeCode] ||
    REQUEST_TYPE_ALIASES[normalizedRequestType];

  if (!finalRequestType || !VALID_REQUEST_TYPES.includes(finalRequestType)) {
    const error = new Error(
      `Loại nghỉ "${leaveTypeCode}" chưa được cấu hình request_type hợp lệ`,
    );
    error.statusCode = 400;
    throw error;
  }

  return finalRequestType;
}

// ============================================
// NHÂN VIÊN — Self-service
// ============================================

/**
 * GET /leave-requests/me
 * Nhân viên xem danh sách đơn nghỉ của mình
 */
export async function getMyLeaveRequests(userId, query) {
  const employee = await getEmployeeByUserId(userId);
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);

  const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
  const status = validStatuses.includes(query.status) ? query.status : null;

  const result = await LeaveRequestModel.getByEmployeeId({
    employeeId: employee.id,
    status,
    page,
    limit,
  });

  return {
    leaveRequests: result.leaveRequests.map(formatLeaveRequest),
    pagination: result.pagination,
  };
}

/**
 * POST /leave-requests
 * Nhân viên tạo đơn xin nghỉ
 *
 * Validation flow:
 *   1. Lấy employee từ userId
 *   2. Validate leave_type tồn tại + active
 *   3. Validate endDate >= startDate
 *   4. Validate không chồng ngày với đơn đang PENDING/APPROVED
 *   5. Validate requires_attachment (SICK_LEAVE, MATERNITY_LEAVE)
 *   6. Validate max_days_per_year (ANNUAL_LEAVE)
 *   7. Insert đơn mới với status = PENDING
 */
export async function createLeaveRequest(userId, data) {
  const employee = await getEmployeeByUserId(userId);

  // 1. Validate leave type
  const leaveType = await LeaveTypeModel.getById(data.leaveTypeId);
  if (!leaveType || !leaveType.is_active) {
    const error = new Error(
      "Loại nghỉ phép không hợp lệ hoặc đã bị vô hiệu hóa",
    );
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate dates
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  if (endDate < startDate) {
    const error = new Error(
      "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
    );
    error.statusCode = 400;
    throw error;
  }

  const totalDays = calculateTotalDays(data.startDate, data.endDate);
  const requestType = normalizeRequestType(leaveType.code, data.requestType);

  // 3. Validate không chồng ngày
  const overlap = await LeaveRequestModel.hasOverlap(
    employee.id,
    data.startDate,
    data.endDate,
  );
  if (overlap) {
    const error = new Error(
      "Khoảng ngày nghỉ bị trùng với đơn nghỉ khác đang chờ duyệt hoặc đã duyệt",
    );
    error.statusCode = 409;
    throw error;
  }

  // 4. Validate attachment neu loai nghi yeu cau
  if (leaveType.requires_attachment && !data.attachmentUrl) {
    const error = new Error(
      `Loai nghi "${leaveType.name}" yeu cau dinh kem chung tu`,
    );
    error.statusCode = 400;
    throw error;
  }

  // 5. Validate max_days_per_year (nếu có)
  if (leaveType.max_days_per_year) {
    const year = startDate.getFullYear();
    const usedDays = await LeaveRequestModel.getUsedDaysInYear(
      employee.id,
      leaveType.id,
      year,
    );
    const remaining = parseFloat(leaveType.max_days_per_year) - usedDays;

    if (totalDays > remaining) {
      const error = new Error(
        `Vượt quá số ngày nghỉ còn lại. Tối đa: ${leaveType.max_days_per_year} ngày/năm, đã dùng: ${usedDays}, còn lại: ${remaining}, yêu cầu: ${totalDays}`,
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // 6. Tạo đơn nghỉ
  const id = await LeaveRequestModel.create({
    employeeId: employee.id,
    leaveTypeId: data.leaveTypeId,
    requestType,
    startDate: data.startDate,
    endDate: data.endDate,
    totalDays,
    reason: data.reason,
    attachmentUrl: data.attachmentUrl,
  });

  const created = await LeaveRequestModel.getById(id);
  return formatLeaveRequest(created);
}

/**
 * PATCH /leave-requests/:id/cancel
 * Nhân viên tự hủy đơn (chỉ khi PENDING)
 */
export async function cancelLeaveRequest(userId, requestId) {
  const employee = await getEmployeeByUserId(userId);

  const request = await LeaveRequestModel.getById(requestId);
  if (!request) {
    const error = new Error("Không tìm thấy đơn nghỉ phép");
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

  await LeaveRequestModel.updateStatus(requestId, { status: "CANCELLED" });

  const updated = await LeaveRequestModel.getById(requestId);
  return formatLeaveRequest(updated);
}

// ============================================
// QUẢN LÝ / ADMIN / HRM
// ============================================

/**
 * GET /manager/leave-requests/pending
 * Quản lý xem đơn PENDING cần duyệt
 * - ADMIN/HRM: xem tất cả đơn PENDING
 * - Manager (role khác): chỉ xem đơn của nhân viên trực thuộc / cùng phòng ban
 */
export async function getPendingRequests(userId, roleCode, query) {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);

  // ADMIN / HRM xem toàn bộ đơn PENDING
  if (roleCode === "ADMIN" || roleCode === "HRM") {
    const result = await LeaveRequestModel.getAllPending({ page, limit });
    return {
      leaveRequests: result.leaveRequests.map(formatLeaveRequest),
      pagination: result.pagination,
    };
  }

  // Manager thường: xem đơn của nhân viên trực thuộc / cùng phòng ban
  const employee = await getEmployeeByUserId(userId);
  const result = await LeaveRequestModel.getPendingByManager({
    managerEmployeeId: employee.id,
    departmentId: employee.department_id,
    page,
    limit,
  });

  return {
    leaveRequests: result.leaveRequests.map(formatLeaveRequest),
    pagination: result.pagination,
  };
}

/**
 * PATCH /manager/leave-requests/:id/approve
 * Duyệt đơn nghỉ (PENDING → APPROVED)
 */
export async function approveLeaveRequest(userId, requestId) {
  const approver = await getEmployeeByUserId(userId);

  const request = await LeaveRequestModel.getById(requestId);
  if (!request) {
    const error = new Error("Không tìm thấy đơn nghỉ phép");
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
    const error = new Error("Không thể tự duyệt đơn nghỉ của chính mình");
    error.statusCode = 403;
    throw error;
  }

  await LeaveRequestModel.updateStatus(requestId, {
    status: "APPROVED",
    approvedByEmployeeId: approver.id,
    approvedAt: new Date(),
  });

  const updated = await LeaveRequestModel.getById(requestId);
  return formatLeaveRequest(updated);
}

/**
 * PATCH /manager/leave-requests/:id/reject
 * Từ chối đơn nghỉ (PENDING → REJECTED)
 */
export async function rejectLeaveRequest(userId, requestId, rejectedReason) {
  const approver = await getEmployeeByUserId(userId);

  const request = await LeaveRequestModel.getById(requestId);
  if (!request) {
    const error = new Error("Không tìm thấy đơn nghỉ phép");
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
    const error = new Error("Không thể tự từ chối đơn nghỉ của chính mình");
    error.statusCode = 403;
    throw error;
  }

  await LeaveRequestModel.updateStatus(requestId, {
    status: "REJECTED",
    approvedByEmployeeId: approver.id,
    approvedAt: new Date(),
    rejectedReason: rejectedReason || null,
  });

  const updated = await LeaveRequestModel.getById(requestId);
  return formatLeaveRequest(updated);
}
