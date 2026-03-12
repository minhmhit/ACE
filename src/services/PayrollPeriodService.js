import * as PayrollPeriodModel from "../models/PayrollPeriodModel.js";

// ============================================
// STATE MACHINE
// ============================================

/**
 * OPEN → LOCKED → PAID
 * Mỗi trạng thái chỉ chuyển tiến, không lùi
 */
const STATUS_TRANSITIONS = {
  OPEN: ["LOCKED"],
  LOCKED: ["PAID"],
  PAID: [],
};

// ============================================
// Format response (snake_case → camelCase)
// ============================================
function formatPeriod(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    monthNo: row.month_no,
    yearNo: row.year_no,
    startDate: row.start_date,
    endDate: row.end_date,
    paymentDate: row.payment_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================
// API
// ============================================

/**
 * GET /payroll-periods
 * Query: ?year=2026&page=1&limit=20
 */
export async function getAll(query) {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const year = query.year ? parseInt(query.year) : null;

  const result = await PayrollPeriodModel.getAll({ year, page, limit });
  return {
    payrollPeriods: result.payrollPeriods.map(formatPeriod),
    pagination: result.pagination,
  };
}

/**
 * GET /payroll-periods/:id
 */
export async function getById(id) {
  const period = await PayrollPeriodModel.getById(id);
  if (!period) {
    const error = new Error("Không tìm thấy kỳ lương");
    error.statusCode = 404;
    throw error;
  }
  return formatPeriod(period);
}

/**
 * POST /payroll-periods
 * Tạo kỳ lương mới — unique (month_no, year_no)
 */
export async function create(data) {
  const monthNo = parseInt(data.monthNo);
  const yearNo = parseInt(data.yearNo);

  // Validate month
  if (monthNo < 1 || monthNo > 12) {
    const error = new Error("Tháng phải từ 1-12");
    error.statusCode = 400;
    throw error;
  }

  // Kiểm tra trùng kỳ
  const existing = await PayrollPeriodModel.getByMonthYear(monthNo, yearNo);
  if (existing) {
    const error = new Error(`Kỳ lương tháng ${monthNo}/${yearNo} đã tồn tại`);
    error.statusCode = 409;
    throw error;
  }

  // Validate start_date <= end_date
  if (new Date(data.startDate) > new Date(data.endDate)) {
    const error = new Error(
      "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc",
    );
    error.statusCode = 400;
    throw error;
  }

  // Tạo code tự động: YYYY-MM
  const code = `${yearNo}-${String(monthNo).padStart(2, "0")}`;

  // Kiểm tra code trùng (phòng trường hợp)
  const codeExists = await PayrollPeriodModel.getByCode(code);
  if (codeExists) {
    const error = new Error(`Mã kỳ lương "${code}" đã tồn tại`);
    error.statusCode = 409;
    throw error;
  }

  const id = await PayrollPeriodModel.create({
    code,
    monthNo,
    yearNo,
    startDate: data.startDate,
    endDate: data.endDate,
    paymentDate: data.paymentDate,
  });

  return getById(id);
}

/**
 * PATCH /payroll-periods/:id
 * Chỉnh sửa kỳ lương — chỉ khi OPEN
 */
export async function update(id, data) {
  const period = await PayrollPeriodModel.getById(id);
  if (!period) {
    const error = new Error("Không tìm thấy kỳ lương");
    error.statusCode = 404;
    throw error;
  }

  if (period.status !== "OPEN") {
    const error = new Error(
      `Không thể sửa kỳ lương ở trạng thái "${period.status}". Chỉ kỳ OPEN mới sửa được`,
    );
    error.statusCode = 400;
    throw error;
  }

  // Validate dates nếu có thay đổi
  const finalStart = data.startDate || period.start_date;
  const finalEnd = data.endDate || period.end_date;
  if (new Date(finalStart) > new Date(finalEnd)) {
    const error = new Error(
      "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc",
    );
    error.statusCode = 400;
    throw error;
  }

  await PayrollPeriodModel.update(id, data);
  return getById(id);
}

/**
 * PATCH /payroll-periods/:id/lock
 * Khoá sổ kỳ lương (OPEN → LOCKED)
 */
export async function lockPeriod(id) {
  const period = await PayrollPeriodModel.getById(id);
  if (!period) {
    const error = new Error("Không tìm thấy kỳ lương");
    error.statusCode = 404;
    throw error;
  }

  if (!STATUS_TRANSITIONS[period.status]?.includes("LOCKED")) {
    const error = new Error(
      `Không thể khoá kỳ lương từ trạng thái "${period.status}". Chỉ kỳ OPEN mới khoá được`,
    );
    error.statusCode = 400;
    throw error;
  }

  await PayrollPeriodModel.update(id, { status: "LOCKED" });
  return getById(id);
}

/**
 * PATCH /payroll-periods/:id/mark-paid
 * Đánh dấu đã trả lương (LOCKED → PAID)
 */
export async function markPaid(id, data) {
  const period = await PayrollPeriodModel.getById(id);
  if (!period) {
    const error = new Error("Không tìm thấy kỳ lương");
    error.statusCode = 404;
    throw error;
  }

  if (!STATUS_TRANSITIONS[period.status]?.includes("PAID")) {
    const error = new Error(
      `Không thể đánh dấu đã trả lương từ trạng thái "${period.status}". Chỉ kỳ LOCKED mới chuyển được`,
    );
    error.statusCode = 400;
    throw error;
  }

  await PayrollPeriodModel.update(id, {
    status: "PAID",
    paymentDate: data.paymentDate || new Date().toISOString().split("T")[0],
  });
  return getById(id);
}
