import { pool } from "../config/db.js";
import * as PayrollModel from "../models/PayrollModel.js";
import * as PayrollPeriodModel from "../models/PayrollPeriodModel.js";
import * as EmployeeModel from "../models/EmployeeModel.js";
import * as EmployeePositionHistoryModel from "../models/EmployeePositionHistoryModel.js";
import * as AttendanceModel from "../models/AttendanceModel.js";

// ============================================
// CONSTANTS
// ============================================
const INSURANCE_RATE = 0.105; // 10.5% bảo hiểm

// ============================================
// Format helpers
// ============================================
function formatPayroll(row) {
  if (!row) return null;
  return {
    id: row.id,
    payrollPeriodId: row.payroll_period_id,
    employeeId: row.employee_id,
    positionHistoryId: row.position_history_id,
    baseSalary: row.base_salary,
    allowanceTotal: row.allowance_total,
    bonusTotal: row.bonus_total,
    deductionTotal: row.deduction_total,
    grossSalary: row.gross_salary,
    insuranceAmount: row.insurance_amount,
    taxAmount: row.tax_amount,
    netSalary: row.net_salary,
    payableSalary: row.payable_salary,
    calculationNote: row.calculation_note,
    status: row.status,
    generatedAt: row.generated_at,
    generatedByUserId: row.generated_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // JOIN fields
    periodCode: row.period_code,
    monthNo: row.month_no,
    yearNo: row.year_no,
    periodStatus: row.period_status,
    employeeCode: row.employee_code,
    employeeName: row.employee_name,
    departmentName: row.department_name,
    positionName: row.position_name,
    positionCode: row.position_code,
    generatedByName: row.generated_by_name,
  };
}

function formatItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    payrollId: row.payroll_id,
    itemType: row.item_type,
    itemCode: row.item_code,
    itemName: row.item_name,
    amount: row.amount,
    formulaText: row.formula_text,
    note: row.note,
    createdAt: row.created_at,
  };
}

// ============================================
// GENERATE: Tạo snapshot bảng lương
// ============================================

/**
 * Generate payroll cho 1 nhân viên trong 1 kỳ
 * Logic:
 *  1. Lấy thông tin lương từ employee_position_history tại thời điểm end_date
 *  2. Lấy dữ liệu attendance tháng đó
 *  3. Tính toán: base + allowance + bonus - deduction - insurance - tax
 *  4. INSERT payroll + payroll_items trong transaction
 */
async function generateForEmployee(
  conn,
  period,
  employeeId,
  generatedByUserId,
) {
  // 1. Lấy position/salary tại thời điểm cuối kỳ
  const posHistory = await EmployeePositionHistoryModel.getAtDate(
    employeeId,
    period.end_date,
  );
  if (!posHistory) {
    return {
      employeeId,
      skipped: true,
      reason: "Không có lịch sử chức vụ tại kỳ này",
    };
  }

  const baseSalary = parseFloat(posHistory.base_salary) || 0;
  const allowanceAmount = parseFloat(posHistory.allowance_amount) || 0;

  // 2. Lấy attendance trong tháng
  const attendanceRecords = await AttendanceModel.getByEmployeeMonth({
    employeeId,
    month: period.month_no,
    year: period.year_no,
  });

  // Tính tổng kết chấm công
  let presentDays = 0;
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  let totalWorkMinutes = 0;
  let totalOvertimeMinutes = 0;

  for (const att of attendanceRecords) {
    switch (att.status) {
      case "PRESENT":
        presentDays++;
        totalWorkMinutes += att.work_minutes || 0;
        totalOvertimeMinutes += att.overtime_minutes || 0;
        break;
      case "PAID_LEAVE":
      case "SICK_LEAVE":
      case "MATERNITY_LEAVE":
      case "HOLIDAY":
        paidLeaveDays++;
        break;
      case "UNPAID_LEAVE":
        unpaidLeaveDays++;
        break;
      case "ABSENT":
        // Ngày vắng mặt không tính lương
        break;
    }
  }

  // 3. Tính lương snapshot
  // Bonus, deduction mặc định = 0 (có thể mở rộng sau)
  const bonusTotal = 0;
  const deductionTotal = 0;

  const grossSalary =
    baseSalary + allowanceAmount + bonusTotal - deductionTotal;
  const insuranceAmount = Math.round(baseSalary * INSURANCE_RATE);
  const taxAmount = 0; // Mở rộng sau nếu cần thuế TNCN

  const netSalary = grossSalary - insuranceAmount - taxAmount;
  const payableSalary = netSalary; // Có thể trừ thêm nếu nghỉ không phép

  const calculationNote =
    `Lương tháng ${String(period.month_no).padStart(2, "0")}/${period.year_no}. ` +
    `Ngày công: ${presentDays}, nghỉ phép: ${paidLeaveDays}, nghỉ KL: ${unpaidLeaveDays}. ` +
    `OT: ${totalOvertimeMinutes} phút.`;

  // 4. Xoá payroll cũ nếu có (re-generate DRAFT)
  const existing = await PayrollModel.getByPeriodAndEmployee(
    period.id,
    employeeId,
  );
  if (existing) {
    if (existing.status !== "DRAFT") {
      return {
        employeeId,
        skipped: true,
        reason: `Payroll đã ở trạng thái "${existing.status}", không thể generate lại`,
      };
    }
    await PayrollModel.deleteByPeriodAndEmployee(conn, period.id, employeeId);
  }

  // 5. Tạo payroll + items
  const payrollData = {
    payrollPeriodId: period.id,
    employeeId,
    positionHistoryId: posHistory.id,
    baseSalary,
    allowanceTotal: allowanceAmount,
    bonusTotal,
    deductionTotal,
    grossSalary,
    insuranceAmount,
    taxAmount,
    netSalary,
    payableSalary,
    calculationNote,
    status: "DRAFT",
    generatedByUserId,
  };

  const items = [
    {
      itemType: "BASE",
      itemCode: "BASE_SALARY",
      itemName: "Lương cơ bản",
      amount: baseSalary,
      formulaText: "Theo lịch sử chức vụ",
    },
    {
      itemType: "ALLOWANCE",
      itemCode: "ALLOWANCE",
      itemName: "Phụ cấp",
      amount: allowanceAmount,
      formulaText: "Theo chính sách vị trí",
    },
  ];

  if (bonusTotal > 0) {
    items.push({
      itemType: "BONUS",
      itemCode: "BONUS",
      itemName: "Thưởng",
      amount: bonusTotal,
      formulaText: "Thưởng hiệu suất",
    });
  }

  if (deductionTotal > 0) {
    items.push({
      itemType: "DEDUCTION",
      itemCode: "DEDUCTION",
      itemName: "Khấu trừ",
      amount: deductionTotal,
    });
  }

  items.push({
    itemType: "INSURANCE",
    itemCode: "INSURANCE",
    itemName: "Bảo hiểm",
    amount: insuranceAmount,
    formulaText: `${INSURANCE_RATE * 100}% lương cơ bản`,
  });

  if (taxAmount > 0) {
    items.push({
      itemType: "TAX",
      itemCode: "TAX",
      itemName: "Thuế TNCN",
      amount: taxAmount,
    });
  }

  const payrollId = await PayrollModel.create(conn, payrollData, items);
  return { employeeId, payrollId, generated: true };
}

/**
 * POST /payrolls/generate — Generate payroll cho toàn bộ nhân viên ACTIVE trong 1 kỳ
 * Hoặc cho 1 nhân viên cụ thể (employeeId)
 */
export async function generate({ periodId, employeeId, generatedByUserId }) {
  // Validate kỳ lương
  const period = await PayrollPeriodModel.getById(periodId);
  if (!period) {
    const error = new Error("Không tìm thấy kỳ lương");
    error.statusCode = 404;
    throw error;
  }
  if (period.status !== "OPEN") {
    const error = new Error(
      `Kỳ lương ở trạng thái "${period.status}". Chỉ kỳ OPEN mới generate được`,
    );
    error.statusCode = 400;
    throw error;
  }

  // Lấy danh sách nhân viên cần generate
  let employeeIds = [];
  if (employeeId) {
    const emp = await EmployeeModel.getById(employeeId);
    if (!emp) {
      const error = new Error("Không tìm thấy nhân viên");
      error.statusCode = 404;
      throw error;
    }
    employeeIds = [employeeId];
  } else {
    // Lấy tất cả nhân viên ACTIVE + PROBATION
    const result = await EmployeeModel.getAll({
      page: 1,
      limit: 10000,
      status: "ACTIVE",
    });
    const probResult = await EmployeeModel.getAll({
      page: 1,
      limit: 10000,
      status: "PROBATION",
    });
    employeeIds = [
      ...result.employees.map((e) => e.id),
      ...probResult.employees.map((e) => e.id),
    ];
  }

  if (employeeIds.length === 0) {
    const error = new Error("Không có nhân viên nào cần generate payroll");
    error.statusCode = 400;
    throw error;
  }

  // Generate trong transaction
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const results = [];
    for (const empId of employeeIds) {
      const result = await generateForEmployee(
        conn,
        period,
        empId,
        generatedByUserId,
      );
      results.push(result);
    }

    await conn.commit();

    const generated = results.filter((r) => r.generated);
    const skipped = results.filter((r) => r.skipped);

    return {
      periodId: period.id,
      periodCode: period.code,
      totalEmployees: employeeIds.length,
      generated: generated.length,
      skipped: skipped.length,
      details: results,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ============================================
// ADMIN / HRM: Quản lý payroll
// ============================================

/**
 * GET /payrolls?periodId=1&page=1&limit=20
 */
export async function getByPeriod(query) {
  const periodId = parseInt(query.periodId);
  if (!periodId) {
    const error = new Error("periodId là bắt buộc");
    error.statusCode = 400;
    throw error;
  }

  const period = await PayrollPeriodModel.getById(periodId);
  if (!period) {
    const error = new Error("Không tìm thấy kỳ lương");
    error.statusCode = 404;
    throw error;
  }

  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);

  const result = await PayrollModel.getByPeriodId({ periodId, page, limit });
  return {
    payrolls: result.payrolls.map(formatPayroll),
    pagination: result.pagination,
  };
}

/**
 * GET /payrolls/:id — Chi tiết payroll (kèm items)
 */
export async function getById(id) {
  const payroll = await PayrollModel.getById(id);
  if (!payroll) {
    const error = new Error("Không tìm thấy bảng lương");
    error.statusCode = 404;
    throw error;
  }

  const items = await PayrollModel.getItemsByPayrollId(id);

  return {
    ...formatPayroll(payroll),
    items: items.map(formatItem),
  };
}

/**
 * PATCH /payrolls/:id/finalize — Chốt payroll (DRAFT → FINALIZED)
 */
export async function finalize(id) {
  const payroll = await PayrollModel.getById(id);
  if (!payroll) {
    const error = new Error("Không tìm thấy bảng lương");
    error.statusCode = 404;
    throw error;
  }
  if (payroll.status !== "DRAFT") {
    const error = new Error(
      `Không thể chốt bảng lương ở trạng thái "${payroll.status}". Chỉ DRAFT mới chốt được`,
    );
    error.statusCode = 400;
    throw error;
  }

  await PayrollModel.updateStatus(id, "FINALIZED");
  return getById(id);
}

/**
 * PATCH /payrolls/:id/mark-paid — Đánh dấu đã trả lương (FINALIZED → PAID)
 */
export async function markPaid(id) {
  const payroll = await PayrollModel.getById(id);
  if (!payroll) {
    const error = new Error("Không tìm thấy bảng lương");
    error.statusCode = 404;
    throw error;
  }
  if (payroll.status !== "FINALIZED") {
    const error = new Error(
      `Không thể đánh dấu đã trả lương ở trạng thái "${payroll.status}". Chỉ FINALIZED mới được`,
    );
    error.statusCode = 400;
    throw error;
  }

  await PayrollModel.updateStatus(id, "PAID");
  return getById(id);
}

/**
 * POST /payrolls/finalize-period — Chốt tất cả DRAFT payrolls trong 1 kỳ
 */
export async function finalizePeriod(periodId) {
  const period = await PayrollPeriodModel.getById(periodId);
  if (!period) {
    const error = new Error("Không tìm thấy kỳ lương");
    error.statusCode = 404;
    throw error;
  }

  const affected = await PayrollModel.updateStatusByPeriod(
    periodId,
    "DRAFT",
    "FINALIZED",
  );
  return { periodId, periodCode: period.code, finalizedCount: affected };
}

/**
 * GET /payrolls/statistics?periodId=1 — Thống kê lương theo kỳ
 */
export async function getStatistics(periodId) {
  const period = await PayrollPeriodModel.getById(periodId);
  if (!period) {
    const error = new Error("Không tìm thấy kỳ lương");
    error.statusCode = 404;
    throw error;
  }

  const stats = await PayrollModel.getStatsByPeriod(periodId);
  return {
    periodId: period.id,
    periodCode: period.code,
    monthNo: period.month_no,
    yearNo: period.year_no,
    totalPayrolls: stats.total_payrolls,
    draftCount: stats.draft_count,
    finalizedCount: stats.finalized_count,
    paidCount: stats.paid_count,
    totalGross: stats.total_gross,
    totalInsurance: stats.total_insurance,
    totalTax: stats.total_tax,
    totalNet: stats.total_net,
    totalPayable: stats.total_payable,
  };
}

// ============================================
// SELF-SERVICE: Nhân viên xem lương mình
// ============================================

/**
 * GET /payrolls/me?month=3&year=2026 — Xem lương tháng
 */
export async function getMyPayroll(userId, query) {
  const employee = await EmployeeModel.getByUserId(userId);
  if (!employee) {
    const error = new Error("Không tìm thấy thông tin nhân viên của bạn");
    error.statusCode = 404;
    throw error;
  }

  const month = parseInt(query.month);
  const year = parseInt(query.year);
  if (!month || !year) {
    const error = new Error("Vui lòng cung cấp month và year");
    error.statusCode = 400;
    throw error;
  }

  const payroll = await PayrollModel.getByEmployeeMonth(
    employee.id,
    month,
    year,
  );
  if (!payroll) {
    const error = new Error(`Chưa có bảng lương tháng ${month}/${year}`);
    error.statusCode = 404;
    throw error;
  }

  // Chỉ cho xem nếu đã FINALIZED hoặc PAID
  if (payroll.status === "DRAFT") {
    const error = new Error("Bảng lương đang ở trạng thái nháp, chưa công bố");
    error.statusCode = 403;
    throw error;
  }

  const items = await PayrollModel.getItemsByPayrollId(payroll.id);
  return {
    ...formatPayroll(payroll),
    items: items.map(formatItem),
  };
}

/**
 * GET /payrolls/me/yearly?year=2026 — Tổng hợp lương cả năm
 */
export async function getMyYearlyPayroll(userId, query) {
  const employee = await EmployeeModel.getByUserId(userId);
  if (!employee) {
    const error = new Error("Không tìm thấy thông tin nhân viên của bạn");
    error.statusCode = 404;
    throw error;
  }

  const year = parseInt(query.year);
  if (!year) {
    const error = new Error("Vui lòng cung cấp year");
    error.statusCode = 400;
    throw error;
  }

  const payrolls = await PayrollModel.getByEmployeeYear(employee.id, year);

  // Chỉ trả về payrolls đã FINALIZED/PAID
  const visiblePayrolls = payrolls.filter((p) => p.status !== "DRAFT");

  let totalGross = 0;
  let totalInsurance = 0;
  let totalTax = 0;
  let totalNet = 0;

  const monthlyData = visiblePayrolls.map((p) => {
    totalGross += parseFloat(p.gross_salary) || 0;
    totalInsurance += parseFloat(p.insurance_amount) || 0;
    totalTax += parseFloat(p.tax_amount) || 0;
    totalNet += parseFloat(p.net_salary) || 0;

    return formatPayroll(p);
  });

  return {
    year,
    employeeId: employee.id,
    employeeCode: employee.employee_code,
    monthlyPayrolls: monthlyData,
    summary: {
      totalMonths: monthlyData.length,
      totalGross,
      totalInsurance,
      totalTax,
      totalNet,
    },
  };
}

// ============================================
// PAYROLL SLIP: Phiếu lương chi tiết cho frontend
// ============================================

/**
 * Format phiếu lương tháng — cấu trúc phù hợp in/xem
 */
function formatMonthlySlip(row, items) {
  // Nhóm items theo loại
  const earnings = [];
  const deductions = [];

  for (const item of items) {
    const formatted = formatItem(item);
    if (["BASE", "ALLOWANCE", "BONUS"].includes(item.item_type)) {
      earnings.push(formatted);
    } else {
      deductions.push(formatted);
    }
  }

  return {
    // Thông tin nhân viên
    employee: {
      id: row.employee_id,
      code: row.employee_code,
      name: row.employee_name,
      email: row.employee_email,
      department: row.department_name,
      position: row.position_name,
      positionCode: row.position_code,
      bankAccountNo: row.bank_account_no,
      bankAccountName: row.bank_account_name,
      bankName: row.bank_name,
    },
    // Thông tin kỳ lương
    period: {
      id: row.payroll_period_id,
      code: row.period_code,
      monthNo: row.month_no,
      yearNo: row.year_no,
      startDate: row.period_start_date,
      endDate: row.period_end_date,
      paymentDate: row.payment_date,
    },
    // Tổng hợp lương
    salary: {
      baseSalary: row.base_salary,
      allowanceTotal: row.allowance_total,
      bonusTotal: row.bonus_total,
      deductionTotal: row.deduction_total,
      grossSalary: row.gross_salary,
      insuranceAmount: row.insurance_amount,
      taxAmount: row.tax_amount,
      netSalary: row.net_salary,
      payableSalary: row.payable_salary,
    },
    // Chi tiết từng khoản — phân nhóm thu nhập / khấu trừ
    breakdown: { earnings, deductions },
    // Metadata
    calculationNote: row.calculation_note,
    status: row.status,
    generatedAt: row.generated_at,
  };
}

/**
 * Format tổng hợp năm
 */
function formatYearlySummary(employee, year, payrolls, allItems) {
  let totalBaseSalary = 0;
  let totalAllowance = 0;
  let totalBonus = 0;
  let totalDeduction = 0;
  let totalGross = 0;
  let totalInsurance = 0;
  let totalTax = 0;
  let totalNet = 0;
  let totalPayable = 0;

  const months = payrolls.map((p) => {
    const base = parseFloat(p.base_salary) || 0;
    const allowance = parseFloat(p.allowance_total) || 0;
    const bonus = parseFloat(p.bonus_total) || 0;
    const deduction = parseFloat(p.deduction_total) || 0;
    const gross = parseFloat(p.gross_salary) || 0;
    const insurance = parseFloat(p.insurance_amount) || 0;
    const tax = parseFloat(p.tax_amount) || 0;
    const net = parseFloat(p.net_salary) || 0;
    const payable = parseFloat(p.payable_salary) || 0;

    totalBaseSalary += base;
    totalAllowance += allowance;
    totalBonus += bonus;
    totalDeduction += deduction;
    totalGross += gross;
    totalInsurance += insurance;
    totalTax += tax;
    totalNet += net;
    totalPayable += payable;

    // Items cho tháng này
    const monthItems = (allItems[p.id] || []).map(formatItem);

    return {
      monthNo: p.month_no,
      periodCode: p.period_code,
      status: p.status,
      paymentDate: p.payment_date,
      baseSalary: base,
      allowanceTotal: allowance,
      bonusTotal: bonus,
      deductionTotal: deduction,
      grossSalary: gross,
      insuranceAmount: insurance,
      taxAmount: tax,
      netSalary: net,
      payableSalary: payable,
      items: monthItems,
    };
  });

  return {
    employee: {
      id: employee.id,
      code: employee.employee_code,
      name: employee.user_name,
      email: employee.user_email,
      department: employee.department_name,
    },
    year,
    months,
    summary: {
      totalMonths: months.length,
      totalBaseSalary,
      totalAllowance,
      totalBonus,
      totalDeduction,
      totalGross,
      totalInsurance,
      totalTax,
      totalNet,
      totalPayable,
    },
  };
}

/**
 * GET /payrolls/me/monthly-slip?month=&year= — Phiếu lương tháng (self-service)
 */
export async function getMyMonthlySlip(userId, query) {
  const employee = await EmployeeModel.getByUserId(userId);
  if (!employee) {
    const error = new Error("Không tìm thấy thông tin nhân viên của bạn");
    error.statusCode = 404;
    throw error;
  }

  const month = parseInt(query.month);
  const year = parseInt(query.year);
  if (!month || !year) {
    const error = new Error("Vui lòng cung cấp month và year");
    error.statusCode = 400;
    throw error;
  }

  return _getMonthlySlip(employee.id, month, year);
}

/**
 * GET /payrolls/me/yearly-summary?year= — Tổng hợp lương năm (self-service)
 */
export async function getMyYearlySummary(userId, query) {
  const employee = await EmployeeModel.getByUserId(userId);
  if (!employee) {
    const error = new Error("Không tìm thấy thông tin nhân viên của bạn");
    error.statusCode = 404;
    throw error;
  }

  const year = parseInt(query.year);
  if (!year) {
    const error = new Error("Vui lòng cung cấp year");
    error.statusCode = 400;
    throw error;
  }

  return _getYearlySummary(employee, year);
}

/**
 * GET /admin/payrolls/:employeeId/monthly-slip?month=&year= — Phiếu lương tháng (admin)
 */
export async function getAdminMonthlySlip(employeeId, query) {
  const employee = await EmployeeModel.getById(employeeId);
  if (!employee) {
    const error = new Error("Không tìm thấy nhân viên");
    error.statusCode = 404;
    throw error;
  }

  const month = parseInt(query.month);
  const year = parseInt(query.year);
  if (!month || !year) {
    const error = new Error("Vui lòng cung cấp month và year");
    error.statusCode = 400;
    throw error;
  }

  return _getMonthlySlip(employeeId, month, year, true);
}

/**
 * GET /admin/payrolls/:employeeId/yearly-summary?year= — Tổng hợp năm (admin)
 */
export async function getAdminYearlySummary(employeeId, query) {
  const employee = await EmployeeModel.getById(employeeId);
  if (!employee) {
    const error = new Error("Không tìm thấy nhân viên");
    error.statusCode = 404;
    throw error;
  }

  const year = parseInt(query.year);
  if (!year) {
    const error = new Error("Vui lòng cung cấp year");
    error.statusCode = 400;
    throw error;
  }

  return _getYearlySummary(employee, year, true);
}

// ============================================
// Internal helpers
// ============================================

/**
 * Logic chung lấy phiếu lương tháng
 * @param {boolean} isAdmin — Admin có thể xem cả DRAFT
 */
async function _getMonthlySlip(employeeId, month, year, isAdmin = false) {
  const payroll = await PayrollModel.getMonthlySlip(employeeId, month, year);
  if (!payroll) {
    const error = new Error(`Chưa có bảng lương tháng ${month}/${year}`);
    error.statusCode = 404;
    throw error;
  }

  // Nhân viên chỉ xem được FINALIZED/PAID
  if (!isAdmin && payroll.status === "DRAFT") {
    const error = new Error("Bảng lương đang ở trạng thái nháp, chưa công bố");
    error.statusCode = 403;
    throw error;
  }

  const items = await PayrollModel.getItemsByPayrollId(payroll.id);
  return formatMonthlySlip(payroll, items);
}

/**
 * Logic chung tổng hợp năm
 * @param {boolean} isAdmin — Admin có thể xem cả DRAFT
 */
async function _getYearlySummary(employee, year, isAdmin = false) {
  const payrolls = await PayrollModel.getYearlySummary(employee.id, year);

  // Nhân viên chỉ xem FINALIZED/PAID, admin xem tất cả
  const visiblePayrolls = isAdmin
    ? payrolls
    : payrolls.filter((p) => p.status !== "DRAFT");

  if (visiblePayrolls.length === 0) {
    const error = new Error(`Chưa có dữ liệu lương năm ${year}`);
    error.statusCode = 404;
    throw error;
  }

  // Lấy items cho tất cả payrolls (batch)
  const allItems = {};
  for (const p of visiblePayrolls) {
    allItems[p.id] = await PayrollModel.getItemsByPayrollId(p.id);
  }

  return formatYearlySummary(employee, year, visiblePayrolls, allItems);
}
