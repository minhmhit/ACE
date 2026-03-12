import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import * as EmployeeModel from "../models/EmployeeModel.js";
import * as EmployeePositionHistoryModel from "../models/EmployeePositionHistoryModel.js";
import * as UserModel from "../models/UserModel.js";

// ============================================
// ENUMS hợp lệ
// ============================================
const VALID_STATUSES = [
  "PROBATION",
  "ACTIVE",
  "ON_LEAVE",
  "RESIGNED",
  "TERMINATED",
];
const VALID_EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "INTERN", "CONTRACT"];

/**
 * State machine cho chuyển trạng thái employee
 * Key: trạng thái hiện tại → Value: danh sách trạng thái được phép chuyển sang
 */
const STATUS_TRANSITIONS = {
  PROBATION: ["ACTIVE", "TERMINATED"],
  ACTIVE: ["ON_LEAVE", "RESIGNED", "TERMINATED"],
  ON_LEAVE: ["ACTIVE", "RESIGNED", "TERMINATED"],
  RESIGNED: [],
  TERMINATED: [],
};

// ============================================
// Format response (snake_case → camelCase)
// ============================================
function formatEmployee(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    employeeCode: row.employee_code,
    departmentId: row.department_id,
    directManagerEmployeeId: row.direct_manager_employee_id,
    employmentType: row.employment_type,
    status: row.status,
    hireDate: row.hire_date,
    officialDate: row.official_date,
    terminationDate: row.termination_date,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    nationalId: row.national_id,
    address: row.address,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    bankAccountNo: row.bank_account_no,
    bankAccountName: row.bank_account_name,
    bankName: row.bank_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // JOIN fields
    userName: row.user_name || null,
    userEmail: row.user_email || null,
    username: row.username || null,
    phoneNumber: row.phone_number || null,
    avatarUrl: row.avatar_url || null,
    departmentCode: row.department_code || null,
    departmentName: row.department_name || null,
    managerCode: row.manager_code || null,
    managerName: row.manager_name || null,
    currentPosition: row.current_position_id
      ? {
          id: row.current_position_id,
          code: row.current_position_code,
          name: row.current_position_name,
          baseSalary: row.base_salary,
          allowanceAmount: row.allowance_amount,
          salaryType: row.salary_type,
        }
      : null,
  };
}

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
// SELF-SERVICE (nhân viên tự xem/sửa thông tin cá nhân)
// ============================================

/**
 * Nhân viên xem profile của mình
 */
export async function getMe(userId) {
  const employee = await EmployeeModel.getByUserId(userId);
  if (!employee) {
    const error = new Error("Không tìm thấy hồ sơ nhân viên");
    error.statusCode = 404;
    throw error;
  }
  return formatEmployee(employee);
}

/**
 * Nhân viên tự cập nhật thông tin cá nhân
 * Chỉ cho phép: address, emergencyContactName, emergencyContactPhone, bankAccountNo, bankAccountName, bankName
 */
export async function updateMe(userId, updateData) {
  const employee = await EmployeeModel.getByUserId(userId);
  if (!employee) {
    const error = new Error("Không tìm thấy hồ sơ nhân viên");
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    "address",
    "emergencyContactName",
    "emergencyContactPhone",
    "bankAccountNo",
    "bankAccountName",
    "bankName",
  ];
  const filteredData = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  if (Object.keys(filteredData).length === 0) {
    const error = new Error("Không có dữ liệu cần cập nhật");
    error.statusCode = 400;
    throw error;
  }

  await EmployeeModel.update(employee.id, filteredData);
  return getMe(userId);
}

// ============================================
// ADMIN / HRM
// ============================================

/**
 * Lấy danh sách nhân viên (search, filter, phân trang)
 */
export async function getAll(query) {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);

  const result = await EmployeeModel.getAll({
    page,
    limit,
    search: query.search || null,
    status: VALID_STATUSES.includes(query.status) ? query.status : null,
    departmentId: query.departmentId ? parseInt(query.departmentId) : null,
    employmentType: VALID_EMPLOYMENT_TYPES.includes(query.employmentType)
      ? query.employmentType
      : null,
  });

  return {
    employees: result.employees.map(formatEmployee),
    pagination: result.pagination,
  };
}

/**
 * Lấy chi tiết nhân viên theo id
 */
export async function getById(id) {
  const employee = await EmployeeModel.getById(id);
  if (!employee) {
    const error = new Error("Không tìm thấy nhân viên");
    error.statusCode = 404;
    throw error;
  }
  return formatEmployee(employee);
}

/**
 * Tạo nhân viên mới (transaction: createUser → createEmployee → createPositionHistory)
 */
export async function create(data, currentUserId) {
  // Validate email unique
  const emailExists = await UserModel.isEmailExists(data.email);
  if (emailExists) {
    const error = new Error("Email đã được sử dụng");
    error.statusCode = 409;
    throw error;
  }

  // Validate username unique
  if (data.username) {
    const usernameExists = await UserModel.isUsernameExists(data.username);
    if (usernameExists) {
      const error = new Error("Username đã tồn tại");
      error.statusCode = 409;
      throw error;
    }
  }

  // Validate employee_code unique
  const codeExists = await EmployeeModel.isCodeExists(data.employeeCode);
  if (codeExists) {
    const error = new Error("Mã nhân viên đã tồn tại");
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const finalUsername =
    data.username || data.email.split("@")[0] + "_" + Date.now();

  // Transaction: user → employee → position history
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Tạo user
    const userId = await EmployeeModel.createUserInTransaction(conn, {
      name: data.name,
      email: data.email,
      username: finalUsername,
      password: hashedPassword,
      roleId: data.roleId || 2,
      phoneNumber: data.phoneNumber,
      avatarUrl: data.avatarUrl,
    });

    // 2. Tạo employee
    const employeeId = await EmployeeModel.create(conn, {
      userId,
      employeeCode: data.employeeCode,
      departmentId: data.departmentId,
      directManagerEmployeeId: data.directManagerEmployeeId,
      employmentType: data.employmentType,
      status: data.status || "ACTIVE",
      hireDate: data.hireDate,
      officialDate: data.officialDate,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      nationalId: data.nationalId,
      address: data.address,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      bankAccountNo: data.bankAccountNo,
      bankAccountName: data.bankAccountName,
      bankName: data.bankName,
    });

    // 3. Tạo position history (nếu có positionId)
    if (data.positionId) {
      await EmployeePositionHistoryModel.create(conn, {
        employeeId,
        positionId: data.positionId,
        departmentId: data.departmentId,
        effectiveFrom: data.hireDate,
        baseSalary: data.baseSalary || 0,
        allowanceAmount: data.allowanceAmount || 0,
        salaryType: data.salaryType || "MONTHLY",
        note: "Bổ nhiệm ban đầu",
        changedReason: "Tạo nhân viên mới",
        changedByUserId: currentUserId,
      });
    }

    await conn.commit();
    return getById(employeeId);
  } catch (err) {
    await conn.rollback();
    // Bắt lỗi duplicate entry
    if (err.code === "ER_DUP_ENTRY") {
      const error = new Error(
        "Dữ liệu bị trùng (email, username hoặc mã nhân viên)",
      );
      error.statusCode = 409;
      throw error;
    }
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Cập nhật thông tin nhân viên (admin/HRM)
 */
export async function update(id, data) {
  const employee = await EmployeeModel.getById(id);
  if (!employee) {
    const error = new Error("Không tìm thấy nhân viên");
    error.statusCode = 404;
    throw error;
  }

  // Chỉ cho phép các trường không liên quan đến position/salary
  const allowedFields = [
    "departmentId",
    "directManagerEmployeeId",
    "employmentType",
    "hireDate",
    "officialDate",
    "dateOfBirth",
    "gender",
    "nationalId",
    "address",
    "emergencyContactName",
    "emergencyContactPhone",
    "bankAccountNo",
    "bankAccountName",
    "bankName",
  ];

  const filteredData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  }

  if (Object.keys(filteredData).length === 0) {
    const error = new Error("Không có dữ liệu cần cập nhật");
    error.statusCode = 400;
    throw error;
  }

  await EmployeeModel.update(id, filteredData);
  return getById(id);
}

/**
 * Chuyển trạng thái nhân viên (state machine)
 */
export async function changeStatus(id, newStatus, currentUserId) {
  const employee = await EmployeeModel.getById(id);
  if (!employee) {
    const error = new Error("Không tìm thấy nhân viên");
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = employee.status;
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    const error = new Error(
      `Không thể chuyển từ trạng thái "${currentStatus}" sang "${newStatus}". Cho phép: ${allowedTransitions.join(", ") || "không có"}`,
    );
    error.statusCode = 400;
    throw error;
  }

  const updateData = { status: newStatus };

  // Nếu nghỉ việc hoặc sa thải, set termination_date
  if (newStatus === "RESIGNED" || newStatus === "TERMINATED") {
    updateData.terminationDate = new Date().toISOString().split("T")[0];
  }

  await EmployeeModel.update(id, updateData);
  return getById(id);
}

/**
 * Đổi chức vụ / lương (transaction: đóng bản ghi cũ → tạo bản ghi mới)
 */
export async function changePosition(employeeId, data, currentUserId) {
  const employee = await EmployeeModel.getById(employeeId);
  if (!employee) {
    const error = new Error("Không tìm thấy nhân viên");
    error.statusCode = 404;
    throw error;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Đóng bản ghi position hiện tại
    await EmployeePositionHistoryModel.closeCurrent(
      conn,
      employeeId,
      data.effectiveFrom,
    );

    // 2. Tạo bản ghi position mới
    await EmployeePositionHistoryModel.create(conn, {
      employeeId,
      positionId: data.positionId,
      departmentId: data.departmentId || employee.department_id,
      effectiveFrom: data.effectiveFrom,
      baseSalary: data.baseSalary,
      allowanceAmount: data.allowanceAmount || 0,
      salaryType: data.salaryType || "MONTHLY",
      note: data.note,
      changedReason: data.changedReason,
      changedByUserId: currentUserId,
    });

    // 3. Nếu đổi department thì cập nhật employees.department_id
    if (data.departmentId && data.departmentId !== employee.department_id) {
      await conn.query("UPDATE employees SET department_id = ? WHERE id = ?", [
        data.departmentId,
        employeeId,
      ]);
    }

    await conn.commit();
    return getById(employeeId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Lấy lịch sử chức vụ của nhân viên
 */
export async function getPositionHistory(employeeId) {
  const employee = await EmployeeModel.getById(employeeId);
  if (!employee) {
    const error = new Error("Không tìm thấy nhân viên");
    error.statusCode = 404;
    throw error;
  }

  const history =
    await EmployeePositionHistoryModel.getByEmployeeId(employeeId);
  return history.map(formatPositionHistory);
}
