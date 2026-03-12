import { validationResult } from "express-validator";
import * as PayrollService from "../services/PayrollService.js";

// ============================================
// SELF-SERVICE (nhân viên xem lương)
// ============================================

/**
 * GET /payrolls/me — Xem lương tháng của mình
 * Query: ?month=3&year=2026
 */
export async function getMyPayroll(req, res, next) {
  try {
    const result = await PayrollService.getMyPayroll(req.user.id, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /payrolls/me/yearly — Tổng hợp lương cả năm
 * Query: ?year=2026
 */
export async function getMyYearlyPayroll(req, res, next) {
  try {
    const result = await PayrollService.getMyYearlyPayroll(
      req.user.id,
      req.query,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /payrolls/me/monthly-slip — Phiếu lương tháng (self-service)
 * Query: ?month=3&year=2026
 */
export async function getMyMonthlySlip(req, res, next) {
  try {
    const result = await PayrollService.getMyMonthlySlip(
      req.user.id,
      req.query,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /payrolls/me/yearly-summary — Tổng hợp lương năm (self-service)
 * Query: ?year=2026
 */
export async function getMyYearlySummary(req, res, next) {
  try {
    const result = await PayrollService.getMyYearlySummary(
      req.user.id,
      req.query,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /admin/payrolls/:employeeId/monthly-slip — Phiếu lương tháng (admin)
 * Query: ?month=3&year=2026
 */
export async function getAdminMonthlySlip(req, res, next) {
  try {
    const result = await PayrollService.getAdminMonthlySlip(
      req.params.employeeId,
      req.query,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /admin/payrolls/:employeeId/yearly-summary — Tổng hợp năm (admin)
 * Query: ?year=2026
 */
export async function getAdminYearlySummary(req, res, next) {
  try {
    const result = await PayrollService.getAdminYearlySummary(
      req.params.employeeId,
      req.query,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// ============================================
// ADMIN / HRM
// ============================================

/**
 * GET /payrolls — Danh sách payrolls theo kỳ
 * Query: ?periodId=1&page=1&limit=20
 */
export async function getByPeriod(req, res, next) {
  try {
    const result = await PayrollService.getByPeriod(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /payrolls/:id — Chi tiết payroll
 */
export async function getById(req, res, next) {
  try {
    const result = await PayrollService.getById(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /payrolls/generate — Generate payroll cho kỳ lương
 */
export async function generate(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const result = await PayrollService.generate({
      periodId: req.body.periodId,
      employeeId: req.body.employeeId || null,
      generatedByUserId: req.user.id,
    });
    res.status(201).json({
      success: true,
      message: `Generate thành công ${result.generated}/${result.totalEmployees} payroll`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /payrolls/:id/finalize — Chốt payroll đơn lẻ
 */
export async function finalize(req, res, next) {
  try {
    const result = await PayrollService.finalize(req.params.id);
    res.json({
      success: true,
      message: "Chốt bảng lương thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /payrolls/:id/mark-paid — Đánh dấu đã trả lương
 */
export async function markPaid(req, res, next) {
  try {
    const result = await PayrollService.markPaid(req.params.id);
    res.json({
      success: true,
      message: "Đánh dấu đã trả lương thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /payrolls/finalize-period — Chốt tất cả DRAFT payrolls trong kỳ
 */
export async function finalizePeriod(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const result = await PayrollService.finalizePeriod(req.body.periodId);
    res.json({
      success: true,
      message: `Đã chốt ${result.finalizedCount} bảng lương`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /payrolls/statistics — Thống kê lương theo kỳ
 * Query: ?periodId=1
 */
export async function getStatistics(req, res, next) {
  try {
    const periodId = parseInt(req.query.periodId);
    if (!periodId) {
      return res.status(400).json({
        success: false,
        error: "periodId là bắt buộc",
      });
    }

    const result = await PayrollService.getStatistics(periodId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
