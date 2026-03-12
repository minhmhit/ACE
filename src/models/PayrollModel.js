import { pool } from "../config/db.js";

// ============================================
// Truy vấn bảng payrolls + payroll_items
// ============================================

/**
 * Lấy payroll theo id (JOIN employee, period, position)
 */
export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT pr.*,
            pp.code as period_code, pp.month_no, pp.year_no, pp.status as period_status,
            e.employee_code, e.department_id,
            u.name as employee_name,
            d.name as department_name,
            p.name as position_name, p.code as position_code,
            gen_u.name as generated_by_name
     FROM payrolls pr
     JOIN payroll_periods pp ON pr.payroll_period_id = pp.id
     JOIN employees e ON pr.employee_id = e.id
     JOIN users u ON e.user_id = u.id
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN employee_position_history eph ON pr.position_history_id = eph.id
     LEFT JOIN positions p ON eph.position_id = p.id
     LEFT JOIN users gen_u ON pr.generated_by_user_id = gen_u.id
     WHERE pr.id = ?`,
    [id],
  );
  return rows[0];
}

/**
 * Lấy payroll theo payroll_period_id + employee_id (unique key)
 */
export async function getByPeriodAndEmployee(periodId, employeeId) {
  const [rows] = await pool.query(
    "SELECT * FROM payrolls WHERE payroll_period_id = ? AND employee_id = ?",
    [periodId, employeeId],
  );
  return rows[0];
}

/**
 * Lấy danh sách payrolls theo kỳ lương (pagination)
 */
export async function getByPeriodId({ periodId, page, limit }) {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT pr.*,
            e.employee_code, e.department_id,
            u.name as employee_name,
            d.name as department_name,
            p.name as position_name
     FROM payrolls pr
     JOIN employees e ON pr.employee_id = e.id
     JOIN users u ON e.user_id = u.id
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN employee_position_history eph ON pr.position_history_id = eph.id
     LEFT JOIN positions p ON eph.position_id = p.id
     WHERE pr.payroll_period_id = ?
     ORDER BY e.employee_code ASC
     LIMIT ? OFFSET ?`,
    [periodId, limit, offset],
  );

  const [countResult] = await pool.query(
    "SELECT COUNT(*) as count FROM payrolls WHERE payroll_period_id = ?",
    [periodId],
  );

  return {
    payrolls: rows,
    pagination: {
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    },
  };
}

/**
 * Lấy payroll items theo payroll_id
 */
export async function getItemsByPayrollId(payrollId) {
  const [rows] = await pool.query(
    `SELECT * FROM payroll_items
     WHERE payroll_id = ?
     ORDER BY FIELD(item_type, 'BASE', 'ALLOWANCE', 'BONUS', 'DEDUCTION', 'INSURANCE', 'TAX', 'OTHER')`,
    [payrollId],
  );
  return rows;
}

/**
 * Lấy payroll của nhân viên theo tháng/năm (self-service)
 */
export async function getByEmployeeMonth(employeeId, month, year) {
  const [rows] = await pool.query(
    `SELECT pr.*,
            pp.code as period_code, pp.month_no, pp.year_no
     FROM payrolls pr
     JOIN payroll_periods pp ON pr.payroll_period_id = pp.id
     WHERE pr.employee_id = ? AND pp.month_no = ? AND pp.year_no = ?`,
    [employeeId, month, year],
  );
  return rows[0];
}

/**
 * Lấy tất cả payroll của nhân viên trong 1 năm (self-service yearly)
 */
export async function getByEmployeeYear(employeeId, year) {
  const [rows] = await pool.query(
    `SELECT pr.*,
            pp.code as period_code, pp.month_no, pp.year_no
     FROM payrolls pr
     JOIN payroll_periods pp ON pr.payroll_period_id = pp.id
     WHERE pr.employee_id = ? AND pp.year_no = ?
     ORDER BY pp.month_no ASC`,
    [employeeId, year],
  );
  return rows;
}

/**
 * Tạo payroll + payroll_items trong transaction
 * @param {Object} conn - MySQL connection (transaction)
 * @param {Object} payrollData - Dữ liệu payroll
 * @param {Array} items - Danh sách payroll_items
 */
export async function create(conn, payrollData, items) {
  const [result] = await conn.query(
    `INSERT INTO payrolls
       (payroll_period_id, employee_id, position_history_id, base_salary,
        allowance_total, bonus_total, deduction_total, gross_salary,
        insurance_amount, tax_amount, net_salary, payable_salary,
        calculation_note, status, generated_at, generated_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
    [
      payrollData.payrollPeriodId,
      payrollData.employeeId,
      payrollData.positionHistoryId || null,
      payrollData.baseSalary,
      payrollData.allowanceTotal,
      payrollData.bonusTotal,
      payrollData.deductionTotal,
      payrollData.grossSalary,
      payrollData.insuranceAmount,
      payrollData.taxAmount,
      payrollData.netSalary,
      payrollData.payableSalary,
      payrollData.calculationNote || null,
      payrollData.status || "DRAFT",
      payrollData.generatedByUserId,
    ],
  );

  const payrollId = result.insertId;

  // Insert payroll items
  if (items && items.length > 0) {
    const values = items.map((item) => [
      payrollId,
      item.itemType,
      item.itemCode,
      item.itemName,
      item.amount,
      item.formulaText || null,
      item.note || null,
    ]);

    await conn.query(
      `INSERT INTO payroll_items
         (payroll_id, item_type, item_code, item_name, amount, formula_text, note)
       VALUES ?`,
      [values],
    );
  }

  return payrollId;
}

/**
 * Xoá payroll + items (dùng khi re-generate, trong transaction)
 */
export async function deleteByPeriodAndEmployee(conn, periodId, employeeId) {
  // Xoá items trước (FK)
  await conn.query(
    `DELETE pi FROM payroll_items pi
     JOIN payrolls pr ON pi.payroll_id = pr.id
     WHERE pr.payroll_period_id = ? AND pr.employee_id = ?`,
    [periodId, employeeId],
  );

  // Xoá payroll
  const [result] = await conn.query(
    "DELETE FROM payrolls WHERE payroll_period_id = ? AND employee_id = ?",
    [periodId, employeeId],
  );
  return result.affectedRows > 0;
}

/**
 * Cập nhật status payroll
 */
export async function updateStatus(id, status) {
  const [result] = await pool.query(
    "UPDATE payrolls SET status = ? WHERE id = ?",
    [status, id],
  );
  return result.affectedRows > 0;
}

/**
 * Cập nhật status tất cả payrolls trong 1 kỳ (batch finalize/paid)
 */
export async function updateStatusByPeriod(periodId, fromStatus, toStatus) {
  const [result] = await pool.query(
    "UPDATE payrolls SET status = ? WHERE payroll_period_id = ? AND status = ?",
    [toStatus, periodId, fromStatus],
  );
  return result.affectedRows;
}

/**
 * Thống kê lương theo kỳ
 */
export async function getStatsByPeriod(periodId) {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) as total_payrolls,
       SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draft_count,
       SUM(CASE WHEN status = 'FINALIZED' THEN 1 ELSE 0 END) as finalized_count,
       SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paid_count,
       SUM(gross_salary) as total_gross,
       SUM(insurance_amount) as total_insurance,
       SUM(tax_amount) as total_tax,
       SUM(net_salary) as total_net,
       SUM(payable_salary) as total_payable
     FROM payrolls
     WHERE payroll_period_id = ?`,
    [periodId],
  );
  return rows[0];
}
