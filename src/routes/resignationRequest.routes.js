import express from "express";
import * as ResignationRequestController from "../controllers/ResignationRequestController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createResignationRequestValidation,
  rejectResignationRequestValidation,
} from "../middlewares/resignationValidation.js";

const router = express.Router();

// ============================================
// SELF-SERVICE (nhân viên tự quản lý đơn nghỉ việc)
// ============================================

/**
 * GET /resignation-requests/me — Xem danh sách đơn nghỉ việc của mình
 * Query: ?status=PENDING&page=1&limit=10
 * Quyền: tất cả user đã đăng nhập
 */
router.get("/me", authenticate, ResignationRequestController.getMyRequests);

/**
 * POST /resignation-requests — Tạo đơn xin nghỉ việc
 * Quyền: tất cả user đã đăng nhập
 */
router.post(
  "/",
  authenticate,
  createResignationRequestValidation,
  ResignationRequestController.create,
);

/**
 * PATCH /resignation-requests/:id/cancel — Nhân viên tự huỷ đơn (chỉ PENDING)
 * Quyền: chủ đơn
 */
router.patch("/:id/cancel", authenticate, ResignationRequestController.cancel);

// ============================================
// ADMIN / HRM (duyệt đơn)
// ============================================

/**
 * GET /resignation-requests/pending — Danh sách đơn chờ duyệt
 * Query: ?page=1&limit=10
 * Quyền: ADMIN, HRM
 */
router.get(
  "/pending",
  authenticate,
  authorize("ADMIN", "HRM"),
  ResignationRequestController.getPending,
);

/**
 * PATCH /resignation-requests/:id/approve — Duyệt đơn nghỉ việc
 * Quyền: ADMIN, HRM
 */
router.patch(
  "/:id/approve",
  authenticate,
  authorize("ADMIN", "HRM"),
  ResignationRequestController.approve,
);

/**
 * PATCH /resignation-requests/:id/reject — Từ chối đơn nghỉ việc
 * Quyền: ADMIN, HRM
 */
router.patch(
  "/:id/reject",
  authenticate,
  authorize("ADMIN", "HRM"),
  rejectResignationRequestValidation,
  ResignationRequestController.reject,
);

export default router;
