import express from "express";
import * as AttendanceController from "../controllers/AttendanceController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createManualValidation,
  updateAttendanceValidation,
} from "../middlewares/attendanceValidation.js";

const router = express.Router();

// ============================================
// SELF-SERVICE (nhân viên chấm công)
// ============================================

/**
 * POST /attendance/check-in — Nhân viên check-in ngày hôm nay
 * Quyền: tất cả user đã đăng nhập
 */
router.post("/check-in", authenticate, AttendanceController.checkIn);

/**
 * POST /attendance/check-out — Nhân viên check-out ngày hôm nay
 * Quyền: tất cả user đã đăng nhập
 */
router.post("/check-out", authenticate, AttendanceController.checkOut);

/**
 * GET /attendance/me — Lịch sử chấm công của mình
 * Query: ?month=3&year=2026
 * Quyền: tất cả user đã đăng nhập
 */
router.get("/me", authenticate, AttendanceController.getMyAttendance);

// ============================================
// ADMIN / HRM
// ============================================

/**
 * GET /attendance — Xem chấm công nhân viên
 * Query: ?month=3&year=2026&employeeId=5&page=1&limit=50
 * Quyền: ADMIN, HRM
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HRM"),
  AttendanceController.getAll,
);

/**
 * POST /attendance/manual — Tạo bản ghi chấm công thủ công
 * Quyền: ADMIN, HRM
 */
router.post(
  "/manual",
  authenticate,
  authorize("ADMIN", "HRM"),
  createManualValidation,
  AttendanceController.createManual,
);

/**
 * PATCH /attendance/:id — Sửa bản ghi chấm công
 * Quyền: ADMIN, HRM
 */
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "HRM"),
  updateAttendanceValidation,
  AttendanceController.update,
);

export default router;
