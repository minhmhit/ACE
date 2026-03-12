import { pool } from "../config/db.js";
import * as EmployeeModel from "../models/EmployeeModel.js";
import * as EmployeePositionHistoryModel from "../models/EmployeePositionHistoryModel.js";

// ============================================
// Trạng thái không được phép thao tác position history
// ============================================
const BLOCKED_STATUSES = ["RESIGNED", "TERMINATED"];

// ============================================
// Format response (snake_case → camelCase)
// ============================================
function formatPositionHistory(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeeId: row.employee_id,
    positionId: row.position_id,
    positionCode: row.position_code || null,
    positionName: row.position_name || null,
    departmentId: row.department_id,
    departmentCode: row.department_code || null,
    departmentName: row.department_name || null,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    baseSalary: row.base_salary,
    allowanceAmount: row.allowance_amount,
    salaryType: row.salary_type,
    note: row.note,
    changedReason: row.changed_reason,
    changedByUserId: row.changed_by_user_id,
    changedByName: row.changed_by_name || null,
    createdAt: row.created_at,
  };
}

// ============================================
// Helpers
// ============================================

/**
 * Validate employee tồn tại và ở trạng thái hợp lệ
 */
async function validateEmployee(employeeId, allowBlocked = false) {
  const employee = await EmployeeModel.getById(employeeId);
  if (!employee) {
    const error = new Error("Không tìm thấy nhân viên");
    error.statusCode = 404;
    throw error;
  }
  if (!allowBlocked && BLOCKED_STATUSES.includes(employee.status)) {
    const error = new Error(
      `Nhân viên đang ở trạng thái "${employee.status}", không thể thay đổi chức vụ`,
    );
    error.statusCode = 400;
    throw error;
  }
  return employee;
}

// ============================================
// PUBLIC API
// ============================================

/**
 * GET /employees/:id/position-history
 * Lấy toàn bộ lịch sử chức vụ (mới nhất trước)
 */
export async function getHistory(employeeId) {
  // Chỉ cần validate employee tồn tại, cho phép cả RESIGNED/TERMINATED xem lịch sử
  await validateEmployee(employeeId, true);

  const rows = await EmployeePositionHistoryModel.getByEmployeeId(employeeId);
  return rows.map(formatPositionHistory);
}

/**
 * GET /employees/:id/current-position
 * Lấy chức vụ hiện tại (effective_to IS NULL)
 */
export async function getCurrentPosition(employeeId) {
  await validateEmployee(employeeId, true);

  const current =
    await EmployeePositionHistoryModel.getCurrentByEmployeeId(employeeId);
  if (!current) {
    const error = new Error("Nhân viên chưa được gán chức vụ");
    error.statusCode = 404;
    throw error;
  }
  return formatPositionHistory(current);
}

/**
 * POST /employees/:id/position-history
 * Thêm bản ghi lịch sử chức vụ mới (append-only)
 *
 * Flow transaction:
 *   1. Validate employee + trạng thái
 *   2. Lấy bản ghi hiện tại (effective_to IS NULL)
 *   3. Validate effectiveFrom phải > effective_from của bản ghi hiện tại
 *   4. Trong transaction:
 *      a. Đóng bản ghi cũ (set effective_to = new.effectiveFrom)
 *      b. Kiểm tra chồng lấn thời gian
 *      c. Insert bản ghi mới (effective_to = NULL → bản ghi hiện tại mới)
 *      d. Đồng bộ employees.department_id nếu department thay đổi
 */
export async function addPositionHistory(employeeId, data, currentUserId) {
  const employee = await validateEmployee(employeeId);

  // Lấy bản ghi position hiện tại
  const currentRecord =
    await EmployeePositionHistoryModel.getCurrentByEmployeeId(employeeId);

  // Validate: effectiveFrom phải sau effective_from của bản ghi hiện tại
  if (currentRecord) {
    const currentStart = new Date(currentRecord.effective_from);
    const newStart = new Date(data.effectiveFrom);
    if (newStart <= currentStart) {
      const error = new Error(
        `Ngày hiệu lực mới (${data.effectiveFrom}) phải sau ngày hiệu lực của chức vụ hiện tại (${currentRecord.effective_from})`,
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Bước 1: Đóng bản ghi hiện tại (nếu có)
    if (currentRecord) {
      await EmployeePositionHistoryModel.closeCurrent(
        conn,
        employeeId,
        data.effectiveFrom,
      );
    }

    // Bước 2: Kiểm tra chồng lấn sau khi đóng bản ghi cũ
    const overlap = await EmployeePositionHistoryModel.hasOverlap(
      conn,
      employeeId,
      data.effectiveFrom,
      null, // bản ghi mới là open-ended
    );
    if (overlap) {
      throw Object.assign(
        new Error("Khoảng thời gian bị chồng lấn với bản ghi lịch sử khác"),
        { statusCode: 409 },
      );
    }

    // Bước 3: Insert bản ghi mới
    const newId = await EmployeePositionHistoryModel.create(conn, {
      employeeId,
      positionId: data.positionId,
      departmentId: data.departmentId || employee.department_id,
      effectiveFrom: data.effectiveFrom,
      effectiveTo: null,
      baseSalary: data.baseSalary,
      allowanceAmount: data.allowanceAmount || 0,
      salaryType: data.salaryType || "MONTHLY",
      note: data.note,
      changedReason: data.changedReason,
      changedByUserId: currentUserId,
    });

    // Bước 4: Đồng bộ employees.department_id nếu đổi phòng ban
    const newDeptId = data.departmentId || employee.department_id;
    if (newDeptId && newDeptId !== employee.department_id) {
      await conn.query("UPDATE employees SET department_id = ? WHERE id = ?", [
        newDeptId,
        employeeId,
      ]);
    }

    await conn.commit();

    // Trả về bản ghi vừa tạo kèm thông tin JOIN
    const history =
      await EmployeePositionHistoryModel.getByEmployeeId(employeeId);
    const newRecord = history.find((r) => r.id === newId);
    return formatPositionHistory(newRecord);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Lấy thông tin position + salary tại 1 thời điểm cụ thể (phục vụ payroll)
 * Ví dụ: tính lương tháng 02/2026 → truyền date = '2026-02-15'
 */
export async function getPositionAtDate(employeeId, date) {
  await validateEmployee(employeeId, true);

  const record = await EmployeePositionHistoryModel.getAtDate(employeeId, date);
  if (!record) {
    const error = new Error(
      `Không tìm thấy chức vụ của nhân viên tại thời điểm ${date}`,
    );
    error.statusCode = 404;
    throw error;
  }
  return formatPositionHistory(record);
}
