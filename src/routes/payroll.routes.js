import express from "express";
import * as PayrollController from "../controllers/PayrollController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  generatePayrollValidation,
  finalizePeriodValidation,
  idParamValidation,
} from "../middlewares/payrollValidation.js";

const router = express.Router();

// ============================================
// SELF-SERVICE (nhân viên xem lương mình)
// ============================================

/**
 * GET /payrolls/me — Xem lương tháng của mình
 * Query: ?month=3&year=2026
 * Quyền: tất cả user đã đăng nhập
 */
router.get("/me", authenticate, PayrollController.getMyPayroll);

/**
 * GET /payrolls/me/yearly — Tổng hợp lương cả năm
 * Query: ?year=2026
 * Quyền: tất cả user đã đăng nhập
 */
router.get("/me/yearly", authenticate, PayrollController.getMyYearlyPayroll);

// ============================================
// ADMIN / HRM
// ============================================

/**
 * GET /payrolls/statistics — Thống kê lương theo kỳ
 * Query: ?periodId=1
 * Quyền: ADMIN, HRM
 */
router.get(
  "/statistics",
  authenticate,
  authorize("ADMIN", "HRM"),
  PayrollController.getStatistics,
);

/**
 * GET /payrolls — Danh sách payrolls theo kỳ
 * Query: ?periodId=1&page=1&limit=20
 * Quyền: ADMIN, HRM
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HRM"),
  PayrollController.getByPeriod,
);

/**
 * GET /payrolls/:id — Chi tiết payroll (kèm items)
 * Quyền: ADMIN, HRM
 */
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HRM"),
  idParamValidation,
  PayrollController.getById,
);

/**
 * POST /payrolls/generate — Generate payroll cho kỳ lương
 * Body: { periodId, employeeId? }
 * Quyền: ADMIN, HRM
 */
router.post(
  "/generate",
  authenticate,
  authorize("ADMIN", "HRM"),
  generatePayrollValidation,
  PayrollController.generate,
);

/**
 * PATCH /payrolls/:id/finalize — Chốt payroll đơn lẻ (DRAFT → FINALIZED)
 * Quyền: ADMIN, HRM
 */
router.patch(
  "/:id/finalize",
  authenticate,
  authorize("ADMIN", "HRM"),
  idParamValidation,
  PayrollController.finalize,
);

/**
 * PATCH /payrolls/:id/mark-paid — Đánh dấu đã trả (FINALIZED → PAID)
 * Quyền: ADMIN, HRM
 */
router.patch(
  "/:id/mark-paid",
  authenticate,
  authorize("ADMIN", "HRM"),
  idParamValidation,
  PayrollController.markPaid,
);

/**
 * POST /payrolls/finalize-period — Chốt tất cả DRAFT payrolls trong 1 kỳ
 * Body: { periodId }
 * Quyền: ADMIN, HRM
 */
router.post(
  "/finalize-period",
  authenticate,
  authorize("ADMIN", "HRM"),
  finalizePeriodValidation,
  PayrollController.finalizePeriod,
);

export default router;
