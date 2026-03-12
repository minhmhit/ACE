import express from "express";
import * as EmployeeController from "../controllers/EmployeeController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  updateMeValidation,
  createEmployeeValidation,
  updateEmployeeValidation,
  changeStatusValidation,
  addPositionHistoryValidation,
} from "../middlewares/employeeValidation.js";

const router = express.Router();

// ============================================
// SELF-SERVICE (nhân viên đã đăng nhập)
// ============================================

/**
 * GET /employees/me — Nhân viên xem hồ sơ của mình
 * Quyền: tất cả user đã đăng nhập
 */
router.get("/me", authenticate, EmployeeController.getMe);

/**
 * PATCH /employees/me — Nhân viên tự cập nhật thông tin cá nhân
 * Quyền: tất cả user đã đăng nhập
 */
router.patch(
  "/me",
  authenticate,
  updateMeValidation,
  EmployeeController.updateMe,
);

// ============================================
// ADMIN / HRM
// ============================================

/**
 * GET /employees — Danh sách nhân viên
 * Query: ?page=1&limit=20&search=abc&status=ACTIVE&departmentId=1&employmentType=FULL_TIME
 * Quyền: ADMIN, HRM
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HRM"),
  EmployeeController.getAll,
);

/**
 * GET /employees/:id — Chi tiết nhân viên
 * Quyền: ADMIN, HRM
 */
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HRM"),
  EmployeeController.getById,
);

/**
 * POST /employees — Tạo nhân viên mới (transaction user + employee + position_history)
 * Quyền: ADMIN, HRM
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HRM"),
  createEmployeeValidation,
  EmployeeController.create,
);

/**
 * PATCH /employees/:id — Cập nhật thông tin nhân viên
 * Quyền: ADMIN, HRM
 */
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "HRM"),
  updateEmployeeValidation,
  EmployeeController.update,
);

/**
 * PATCH /employees/:id/status — Chuyển trạng thái nhân viên
 * Quyền: ADMIN, HRM
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "HRM"),
  changeStatusValidation,
  EmployeeController.changeStatus,
);

/**
 * POST /employees/:id/position-history — Thêm lịch sử chức vụ / lương (append-only)
 * Quyền: ADMIN, HRM
 */
router.post(
  "/:id/position-history",
  authenticate,
  authorize("ADMIN", "HRM"),
  addPositionHistoryValidation,
  EmployeeController.addPositionHistory,
);

/**
 * GET /employees/:id/position-history — Lịch sử chức vụ
 * Quyền: ADMIN, HRM
 */
router.get(
  "/:id/position-history",
  authenticate,
  authorize("ADMIN", "HRM"),
  EmployeeController.getPositionHistory,
);

/**
 * GET /employees/:id/current-position — Chức vụ hiện tại
 * Quyền: ADMIN, HRM
 */
router.get(
  "/:id/current-position",
  authenticate,
  authorize("ADMIN", "HRM"),
  EmployeeController.getCurrentPosition,
);

export default router;
