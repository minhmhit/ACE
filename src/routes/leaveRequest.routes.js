import express from "express";
import * as LeaveRequestController from "../controllers/LeaveRequestController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createLeaveRequestValidation,
  rejectLeaveRequestValidation,
} from "../middlewares/leaveValidation.js";

const router = express.Router();

// ============================================
// SELF-SERVICE (nhân viên tự quản lý đơn nghỉ phép)
// ============================================

/**
 * GET /leave-requests/me — Xem danh sách đơn nghỉ phép của mình
 * Query: ?status=PENDING&page=1&limit=10
 * Quyền: tất cả user đã đăng nhập
 */
router.get("/me", authenticate, LeaveRequestController.getMyRequests);

/**
 * POST /leave-requests — Tạo đơn nghỉ phép
 * Quyền: tất cả user đã đăng nhập
 */
router.post(
  "/",
  authenticate,
  createLeaveRequestValidation,
  LeaveRequestController.create,
);

/**
 * PATCH /leave-requests/:id/cancel — Nhân viên tự huỷ đơn (chỉ PENDING)
 * Quyền: chủ đơn
 */
router.patch("/:id/cancel", authenticate, LeaveRequestController.cancel);

// ============================================
// MANAGER / ADMIN / HRM (duyệt đơn)
// ============================================

/**
 * GET /leave-requests/pending — Danh sách đơn chờ duyệt
 * Query: ?page=1&limit=10
 * Quyền: ADMIN, HRM (hoặc quản lý trực tiếp nếu mở rộng)
 */
router.get(
  "/pending",
  authenticate,
  authorize("ADMIN", "HRM"),
  LeaveRequestController.getPending,
);

/**
 * PATCH /leave-requests/:id/approve — Duyệt đơn
 * Quyền: ADMIN, HRM
 */
router.patch(
  "/:id/approve",
  authenticate,
  authorize("ADMIN", "HRM"),
  LeaveRequestController.approve,
);

/**
 * PATCH /leave-requests/:id/reject — Từ chối đơn
 * Quyền: ADMIN, HRM
 */
router.patch(
  "/:id/reject",
  authenticate,
  authorize("ADMIN", "HRM"),
  rejectLeaveRequestValidation,
  LeaveRequestController.reject,
);

export default router;
