import * as AttendanceModel from "../models/AttendanceModel.js";
import * as EmployeeModel from "../models/EmployeeModel.js";

// ============================================
// CONSTANTS
// ============================================

/** Giờ kết thúc ca chuẩn (17:00) — quá giờ này tính overtime */
const STANDARD_END_HOUR = 17;
const STANDARD_END_MINUTE = 0;

/** Trạng thái employee được phép check-in */
const CHECKIN_ALLOWED_STATUSES = ["ACTIVE", "PROBATION", "ON_LEAVE"];

/** Các status hợp lệ của attendance */
const VALID_STATUSES = [
  "PRESENT",
  "ABSENT",
  "PAID_LEAVE",
  "UNPAID_LEAVE",
  "SICK_LEAVE",
  "MATERNITY_LEAVE",
  "HOLIDAY",
];

// ============================================
// Format response (snake_case → camelCase)
// ============================================
function formatAttendance(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeCode: row.employee_code || null,
    employeeName: row.employee_name || null,
    departmentId: row.department_id || null,
    departmentName: row.department_name || null,
    workDate: row.work_date,
    checkIn: row.check_in,
    checkOut: row.check_out,
    workMinutes: row.work_minutes,
    overtimeMinutes: row.overtime_minutes,
    status: row.status,
    note: row.note,
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

/**
 * Tính work_minutes và overtime_minutes từ check_in và check_out
 *
 * Quy tắc (dựa trên seed data):
 * - work_minutes = tổng phút từ check_in → check_out
 * - overtime_minutes = max(0, phút check_out vượt quá 17:00)
 */
function calculateMinutes(checkIn, checkOut) {
  const cin = new Date(checkIn);
  const cout = new Date(checkOut);

  const workMinutes = Math.floor((cout - cin) / (1000 * 60));

  // Tính overtime: phút vượt quá 17:00
  const standardEnd = new Date(cout);
  standardEnd.setHours(STANDARD_END_HOUR, STANDARD_END_MINUTE, 0, 0);

  let overtimeMinutes = 0;
  if (cout > standardEnd) {
    overtimeMinutes = Math.floor((cout - standardEnd) / (1000 * 60));
  }

  return { workMinutes: Math.max(0, workMinutes), overtimeMinutes };
}

/**
 * Lấy ngày hôm nay dạng YYYY-MM-DD (theo local timezone)
 */
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ============================================
// NHÂN VIÊN — Self-service
// ============================================

/**
 * POST /attendance/check-in
 * Nhân viên check-in ngày hôm nay
 */
export async function checkIn(userId) {
  const employee = await getEmployeeByUserId(userId);

  // Kiểm tra trạng thái nhân viên
  if (!CHECKIN_ALLOWED_STATUSES.includes(employee.status)) {
    const error = new Error(
      `Nhân viên ở trạng thái "${employee.status}" không thể chấm công`,
    );
    error.statusCode = 400;
    throw error;
  }

  const today = getTodayDate();

  // Kiểm tra đã check-in hôm nay chưa
  const existing = await AttendanceModel.getByEmployeeAndDate(
    employee.id,
    today,
  );
  if (existing) {
    const error = new Error("Bạn đã chấm công vào (check-in) ngày hôm nay rồi");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date();
  const id = await AttendanceModel.create({
    employeeId: employee.id,
    workDate: today,
    checkIn: now,
    status: "PRESENT",
  });

  const created = await AttendanceModel.getById(id);
  return formatAttendance(created);
}

/**
 * POST /attendance/check-out
 * Nhân viên check-out ngày hôm nay
 */
export async function checkOut(userId) {
  const employee = await getEmployeeByUserId(userId);
  const today = getTodayDate();

  const existing = await AttendanceModel.getByEmployeeAndDate(
    employee.id,
    today,
  );

  // Chưa check-in
  if (!existing || !existing.check_in) {
    const error = new Error(
      "Bạn chưa check-in ngày hôm nay. Vui lòng check-in trước",
    );
    error.statusCode = 400;
    throw error;
  }

  // Đã check-out rồi
  if (existing.check_out) {
    const error = new Error("Bạn đã chấm công ra (check-out) ngày hôm nay rồi");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date();
  const { workMinutes, overtimeMinutes } = calculateMinutes(
    existing.check_in,
    now,
  );

  await AttendanceModel.update(existing.id, {
    checkOut: now,
    workMinutes,
    overtimeMinutes,
  });

  const updated = await AttendanceModel.getById(existing.id);
  return formatAttendance(updated);
}

/**
 * GET /attendance/me?month=&year=
 * Nhân viên xem lịch sử chấm công của mình theo tháng
 */
export async function getMyAttendance(userId, query) {
  const employee = await getEmployeeByUserId(userId);

  const now = new Date();
  const month = parseInt(query.month) || now.getMonth() + 1;
  const year = parseInt(query.year) || now.getFullYear();

  if (month < 1 || month > 12) {
    const error = new Error("Tháng phải từ 1-12");
    error.statusCode = 400;
    throw error;
  }

  const rows = await AttendanceModel.getByEmployeeMonth({
    employeeId: employee.id,
    month,
    year,
  });

  // Tính tổng hợp tháng
  let totalWorkMinutes = 0;
  let totalOvertimeMinutes = 0;
  let presentDays = 0;
  let absentDays = 0;
  let leaveDays = 0;

  for (const row of rows) {
    totalWorkMinutes += row.work_minutes || 0;
    totalOvertimeMinutes += row.overtime_minutes || 0;
    if (row.status === "PRESENT") presentDays++;
    else if (row.status === "ABSENT") absentDays++;
    else if (
      ["PAID_LEAVE", "UNPAID_LEAVE", "SICK_LEAVE", "MATERNITY_LEAVE"].includes(
        row.status,
      )
    )
      leaveDays++;
  }

  return {
    attendances: rows.map(formatAttendance),
    summary: {
      month,
      year,
      totalRecords: rows.length,
      presentDays,
      absentDays,
      leaveDays,
      totalWorkMinutes,
      totalOvertimeMinutes,
    },
  };
}

// ============================================
// ADMIN / HRM
// ============================================

/**
 * GET /attendance?month=&year=&employeeId=
 * Xem chấm công nhân viên (phân trang)
 */
export async function getAll(query) {
  const now = new Date();
  const month = parseInt(query.month) || now.getMonth() + 1;
  const year = parseInt(query.year) || now.getFullYear();
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 50, 200);

  if (month < 1 || month > 12) {
    const error = new Error("Tháng phải từ 1-12");
    error.statusCode = 400;
    throw error;
  }

  const result = await AttendanceModel.getAll({
    month,
    year,
    employeeId: query.employeeId ? parseInt(query.employeeId) : null,
    page,
    limit,
  });

  return {
    attendances: result.attendances.map(formatAttendance),
    pagination: result.pagination,
  };
}

/**
 * POST /attendance/manual
 * Admin/HRM tạo bản ghi chấm công thủ công
 * (cho nghỉ phép, vắng, ngày lễ, hoặc bổ sung check-in/check-out)
 */
export async function createManual(data) {
  // Validate employee tồn tại
  const employee = await EmployeeModel.getById(data.employeeId);
  if (!employee) {
    const error = new Error("Không tìm thấy nhân viên");
    error.statusCode = 404;
    throw error;
  }

  // Validate status
  if (!VALID_STATUSES.includes(data.status)) {
    const error = new Error(
      `Status không hợp lệ. Cho phép: ${VALID_STATUSES.join(", ")}`,
    );
    error.statusCode = 400;
    throw error;
  }

  // Kiểm tra unique (employee_id, work_date)
  const existing = await AttendanceModel.getByEmployeeAndDate(
    data.employeeId,
    data.workDate,
  );
  if (existing) {
    const error = new Error(
      `Nhân viên đã có bản ghi chấm công ngày ${data.workDate}. Vui lòng dùng chức năng sửa`,
    );
    error.statusCode = 409;
    throw error;
  }

  // Tính work_minutes / overtime nếu có cả check_in và check_out
  let workMinutes = 0;
  let overtimeMinutes = 0;
  if (data.checkIn && data.checkOut) {
    const calc = calculateMinutes(data.checkIn, data.checkOut);
    workMinutes = calc.workMinutes;
    overtimeMinutes = calc.overtimeMinutes;
  }

  const id = await AttendanceModel.create({
    employeeId: data.employeeId,
    workDate: data.workDate,
    checkIn: data.checkIn || null,
    checkOut: data.checkOut || null,
    workMinutes,
    overtimeMinutes,
    status: data.status,
    note: data.note,
  });

  const created = await AttendanceModel.getById(id);
  return formatAttendance(created);
}

/**
 * PATCH /attendance/:id
 * Admin/HRM sửa bản ghi chấm công
 */
export async function updateAttendance(id, data) {
  const attendance = await AttendanceModel.getById(id);
  if (!attendance) {
    const error = new Error("Không tìm thấy bản ghi chấm công");
    error.statusCode = 404;
    throw error;
  }

  // Validate status nếu có thay đổi
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    const error = new Error(
      `Status không hợp lệ. Cho phép: ${VALID_STATUSES.join(", ")}`,
    );
    error.statusCode = 400;
    throw error;
  }

  // Tính lại work_minutes / overtime nếu check_in hoặc check_out thay đổi
  const finalCheckIn =
    data.checkIn !== undefined ? data.checkIn : attendance.check_in;
  const finalCheckOut =
    data.checkOut !== undefined ? data.checkOut : attendance.check_out;

  const updateData = { ...data };

  if (finalCheckIn && finalCheckOut) {
    const calc = calculateMinutes(finalCheckIn, finalCheckOut);
    updateData.workMinutes = calc.workMinutes;
    updateData.overtimeMinutes = calc.overtimeMinutes;
  }

  await AttendanceModel.update(id, updateData);

  const updated = await AttendanceModel.getById(id);
  return formatAttendance(updated);
}
