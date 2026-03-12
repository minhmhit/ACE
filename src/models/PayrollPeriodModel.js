import { pool } from "../config/db.js";

// ============================================
// Truy vấn bảng payroll_periods
// ============================================

/**
 * Lấy payroll period theo id
 */
export async function getById(id) {
  const [rows] = await pool.query(
    "SELECT * FROM payroll_periods WHERE id = ?",
    [id],
  );
  return rows[0];
}

/**
 * Lấy payroll period theo code
 */
export async function getByCode(code) {
  const [rows] = await pool.query(
    "SELECT * FROM payroll_periods WHERE code = ?",
    [code],
  );
  return rows[0];
}

/**
 * Lấy payroll period theo month + year (unique key)
 */
export async function getByMonthYear(month, year) {
  const [rows] = await pool.query(
    "SELECT * FROM payroll_periods WHERE month_no = ? AND year_no = ?",
    [month, year],
  );
  return rows[0];
}

/**
 * Lấy danh sách payroll periods (filter theo year, phân trang)
 */
export async function getAll({ year, page, limit }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (year) {
    conditions.push("year_no = ?");
    params.push(year);
  }

  const whereClause =
    conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  const [rows] = await pool.query(
    `SELECT * FROM payroll_periods
     ${whereClause}
     ORDER BY year_no DESC, month_no DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as count FROM payroll_periods ${whereClause}`,
    params,
  );

  return {
    payrollPeriods: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}

/**
 * Tạo payroll period
 */
export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO payroll_periods
       (code, month_no, year_no, start_date, end_date, payment_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.code,
      data.monthNo,
      data.yearNo,
      data.startDate,
      data.endDate,
      data.paymentDate || null,
      data.status || "OPEN",
    ],
  );
  return result.insertId;
}

/**
 * Cập nhật payroll period
 */
export async function update(id, data) {
  const fields = [];
  const params = [];

  const fieldMap = {
    startDate: "start_date",
    endDate: "end_date",
    paymentDate: "payment_date",
    status: "status",
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
    `UPDATE payroll_periods SET ${fields.join(", ")} WHERE id = ?`,
    params,
  );
  return result.affectedRows > 0;
}
