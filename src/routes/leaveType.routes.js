import express from "express";
import * as LeaveTypeController from "../controllers/LeaveTypeController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createLeaveTypeValidation,
  updateLeaveTypeValidation,
} from "../middlewares/leaveValidation.js";

const router = express.Router();

/**
 * GET /leave-types — Danh sách loại nghỉ phép
 * Query: ?isActive=true
 * Quyền: ADMIN, HRM
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HRM"),
  LeaveTypeController.getAll,
);

/**
 * POST /leave-types — Tạo loại nghỉ phép mới
 * Quyền: ADMIN
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createLeaveTypeValidation,
  LeaveTypeController.create,
);

/**
 * PATCH /leave-types/:id — Cập nhật loại nghỉ phép
 * Quyền: ADMIN
 */
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updateLeaveTypeValidation,
  LeaveTypeController.update,
);

export default router;
