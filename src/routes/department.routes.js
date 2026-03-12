import express from "express";
import * as DepartmentController from "../controllers/DepartmentController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createDepartmentValidation,
  updateDepartmentValidation,
  toggleActiveValidation,
} from "../middlewares/departmentPositionValidation.js";

const router = express.Router();

/**
 * GET /departments - Danh sách phòng ban
 * Query: ?page=1&limit=20&search=abc&isActive=true
 * Quyền: ADMIN, HRM
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HRM"),
  DepartmentController.getAll,
);

/**
 * GET /departments/:id - Chi tiết phòng ban
 * Quyền: ADMIN, HRM
 */
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HRM"),
  DepartmentController.getById,
);

/**
 * POST /departments - Tạo phòng ban
 * Quyền: ADMIN
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createDepartmentValidation,
  DepartmentController.create,
);

/**
 * PATCH /departments/:id - Cập nhật phòng ban
 * Quyền: ADMIN
 */
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updateDepartmentValidation,
  DepartmentController.update,
);

/**
 * PATCH /departments/:id/active - Kích hoạt/vô hiệu hóa
 * Quyền: ADMIN
 */
router.patch(
  "/:id/active",
  authenticate,
  authorize("ADMIN"),
  toggleActiveValidation,
  DepartmentController.toggleActive,
);

export default router;
