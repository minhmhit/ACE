import express from "express";
import * as PayrollPeriodController from "../controllers/PayrollPeriodController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createPayrollPeriodValidation,
  updatePayrollPeriodValidation,
  markPaidValidation,
  idParamValidation,
} from "../middlewares/payrollPeriodValidation.js";

const router = express.Router();

// ============================================
// PAYROLL PERIOD ROUTES — Quản lý kỳ lương
// Quyền: ADMIN, HRM
// ============================================

/**
 * GET /payroll-periods — Danh sách kỳ lương
 * Query: ?year=2026&page=1&limit=20
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HRM"),
  PayrollPeriodController.getAll,
);

/**
 * GET /payroll-periods/:id — Chi tiết kỳ lương
 */
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HRM"),
  idParamValidation,
  PayrollPeriodController.getById,
);

/**
 * POST /payroll-periods — Tạo kỳ lương mới
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HRM"),
  createPayrollPeriodValidation,
  PayrollPeriodController.create,
);

/**
 * PATCH /payroll-periods/:id — Cập nhật kỳ lương (chỉ khi OPEN)
 */
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "HRM"),
  updatePayrollPeriodValidation,
  PayrollPeriodController.update,
);

/**
 * PATCH /payroll-periods/:id/lock — Khoá sổ kỳ lương (OPEN → LOCKED)
 */
router.patch(
  "/:id/lock",
  authenticate,
  authorize("ADMIN", "HRM"),
  idParamValidation,
  PayrollPeriodController.lockPeriod,
);

/**
 * PATCH /payroll-periods/:id/mark-paid — Đánh dấu đã trả lương (LOCKED → PAID)
 */
router.patch(
  "/:id/mark-paid",
  authenticate,
  authorize("ADMIN", "HRM"),
  markPaidValidation,
  PayrollPeriodController.markPaid,
);

export default router;
