import express from "express";
import * as PositionController from "../controllers/PositionController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createPositionValidation,
  updatePositionValidation,
  toggleActiveValidation,
} from "../middlewares/departmentPositionValidation.js";

const router = express.Router();

/**
 * GET /positions - Danh sách chức vụ
 * Query: ?page=1&limit=20&search=abc&isActive=true
 * Quyền: ADMIN, HRM
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HRM"),
  PositionController.getAll,
);

/**
 * GET /positions/:id - Chi tiết chức vụ
 * Quyền: ADMIN, HRM
 */
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HRM"),
  PositionController.getById,
);

/**
 * POST /positions - Tạo chức vụ
 * Quyền: ADMIN
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createPositionValidation,
  PositionController.create,
);

/**
 * PATCH /positions/:id - Cập nhật chức vụ
 * Quyền: ADMIN
 */
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updatePositionValidation,
  PositionController.update,
);

/**
 * PATCH /positions/:id/active - Kích hoạt/vô hiệu hóa
 * Quyền: ADMIN
 */
router.patch(
  "/:id/active",
  authenticate,
  authorize("ADMIN"),
  toggleActiveValidation,
  PositionController.toggleActive,
);

export default router;
