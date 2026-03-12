import { pool } from "../config/db.js";

// ============================================
// Truy vấn bảng employees
// ============================================

/**
 * Lấy employee theo id (JOIN user, department, position hiện tại)
 */
export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT e.*,
            u.name as user_name, u.email as user_email, u.username,
            u.phoneNumber as phone_number, u.avatarUrl as avatar_url,
            d.code as department_code, d.name as department_name,
            mgr.employee_code as manager_code,
            mgr_u.name as manager_name,
            eph.position_id as current_position_id,
            p.code as current_position_code,
            p.name as current_position_name,
            eph.base_salary, eph.allowance_amount, eph.salary_type
     FROM employees e
     JOIN users u ON e.user_id = u.id
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN employees mgr ON e.direct_manager_employee_id = mgr.id
     LEFT JOIN users mgr_u ON mgr.user_id = mgr_u.id
     LEFT JOIN employee_position_history eph ON eph.employee_id = e.id AND eph.effective_to IS NULL
     LEFT JOIN positions p ON eph.position_id = p.id
     WHERE e.id = ?`,
    [id],
  );
  return rows[0];
}

/**
 * Lấy employee theo user_id
 */
export async function getByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT e.*,
            u.name as user_name, u.email as user_email, u.username,
            u.phoneNumber as phone_number, u.avatarUrl as avatar_url,
            d.code as department_code, d.name as department_name,
            mgr.employee_code as manager_code,
            mgr_u.name as manager_name,
            eph.position_id as current_position_id,
            p.code as current_position_code,
            p.name as current_position_name,
            eph.base_salary, eph.allowance_amount, eph.salary_type
     FROM employees e
     JOIN users u ON e.user_id = u.id
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN employees mgr ON e.direct_manager_employee_id = mgr.id
     LEFT JOIN users mgr_u ON mgr.user_id = mgr_u.id
     LEFT JOIN employee_position_history eph ON eph.employee_id = e.id AND eph.effective_to IS NULL
     LEFT JOIN positions p ON eph.position_id = p.id
     WHERE e.user_id = ?`,
    [userId],
  );
  return rows[0];
}

/**
 * Lấy employee theo employee_code
 */
export async function getByCode(code) {
  const [rows] = await pool.query(
    "SELECT * FROM employees WHERE employee_code = ?",
    [code],
  );
  return rows[0];
}

/**
 * Lấy danh sách employees với search, filter, phân trang
 */
export async function getAll({
  page,
  limit,
  search,
  status,
  departmentId,
  employmentType,
}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("e.status = ?");
    params.push(status);
  }

  if (departmentId) {
    conditions.push("e.department_id = ?");
    params.push(departmentId);
  }

  if (employmentType) {
    conditions.push("e.employment_type = ?");
    params.push(employmentType);
  }

  if (search) {
    conditions.push(
      "(e.employee_code LIKE ? OR u.name LIKE ? OR u.email LIKE ?)",
    );
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const whereClause =
    conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  const [rows] = await pool.query(
    `SELECT e.*,
            u.name as user_name, u.email as user_email, u.username,
            u.phoneNumber as phone_number, u.avatarUrl as avatar_url,
            d.code as department_code, d.name as department_name,
            eph.position_id as current_position_id,
            p.code as current_position_code,
            p.name as current_position_name
     FROM employees e
     JOIN users u ON e.user_id = u.id
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN employee_position_history eph ON eph.employee_id = e.id AND eph.effective_to IS NULL
     LEFT JOIN positions p ON eph.position_id = p.id
     ${whereClause}
     ORDER BY e.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count
     FROM employees e
     JOIN users u ON e.user_id = u.id
     ${whereClause}`,
    params,
  );

  return {
    employees: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}

/**
 * Tạo employee mới (dùng trong transaction, nhận connection)
 */
export async function create(conn, data) {
  const [result] = await conn.query(
    `INSERT INTO employees
       (user_id, employee_code, department_id, direct_manager_employee_id,
        employment_type, status, hire_date, official_date,
        date_of_birth, gender, national_id, address,
        emergency_contact_name, emergency_contact_phone,
        bank_account_no, bank_account_name, bank_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.userId,
      data.employeeCode,
      data.departmentId || null,
      data.directManagerEmployeeId || null,
      data.employmentType || "FULL_TIME",
      data.status || "ACTIVE",
      data.hireDate,
      data.officialDate || null,
      data.dateOfBirth || null,
      data.gender || null,
      data.nationalId || null,
      data.address || null,
      data.emergencyContactName || null,
      data.emergencyContactPhone || null,
      data.bankAccountNo || null,
      data.bankAccountName || null,
      data.bankName || null,
    ],
  );
  return result.insertId;
}

/**
 * Cập nhật employee
 */
export async function update(id, data) {
  const fields = [];
  const params = [];

  const fieldMap = {
    departmentId: "department_id",
    directManagerEmployeeId: "direct_manager_employee_id",
    employmentType: "employment_type",
    status: "status",
    hireDate: "hire_date",
    officialDate: "official_date",
    terminationDate: "termination_date",
    dateOfBirth: "date_of_birth",
    gender: "gender",
    nationalId: "national_id",
    address: "address",
    emergencyContactName: "emergency_contact_name",
    emergencyContactPhone: "emergency_contact_phone",
    bankAccountNo: "bank_account_no",
    bankAccountName: "bank_account_name",
    bankName: "bank_name",
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
    `UPDATE employees SET ${fields.join(", ")} WHERE id = ?`,
    params,
  );
  return result.affectedRows > 0;
}

/**
 * Kiểm tra employee_code đã tồn tại chưa
 */
export async function isCodeExists(code, excludeId = null) {
  const query = excludeId
    ? "SELECT id FROM employees WHERE employee_code = ? AND id != ?"
    : "SELECT id FROM employees WHERE employee_code = ?";
  const queryParams = excludeId ? [code, excludeId] : [code];
  const [rows] = await pool.query(query, queryParams);
  return rows.length > 0;
}

/**
 * Kiểm tra user_id đã có employee chưa
 */
export async function isUserLinked(userId) {
  const [rows] = await pool.query(
    "SELECT id FROM employees WHERE user_id = ?",
    [userId],
  );
  return rows.length > 0;
}

/**
 * Tạo user mới (dùng trong transaction, nhận connection)
 */
export async function createUserInTransaction(conn, data) {
  const [result] = await conn.query(
    `INSERT INTO users (name, email, username, password, roleId, phoneNumber, avatarUrl)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.email,
      data.username,
      data.password,
      data.roleId,
      data.phoneNumber || null,
      data.avatarUrl || null,
    ],
  );
  return result.insertId;
}
