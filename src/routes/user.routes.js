import express from "express";
import * as UserController from "../controllers/UserController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  updateMeValidation,
  adminCreateUserValidation,
  adminUpdateUserValidation,
  toggleActiveValidation,
} from "../middlewares/userValidation.js";

// ============================================
// Self-service routes — mount tại /api/v1/users
// ============================================
export const userRouter = express.Router();

/**
 * GET /users/me - Lấy profile hiện tại
 */
userRouter.get("/me", authenticate, UserController.getMe);

/**
 * PATCH /users/me - User tự cập nhật profile
 * Body: { name?, phoneNumber?, username?, avatarUrl? }
 */
userRouter.patch(
  "/me",
  authenticate,
  updateMeValidation,
  UserController.updateMe,
);

// ============================================
// Admin routes — mount tại /api/v1/admin/users
// ============================================
export const adminUserRouter = express.Router();

/**
 * GET /admin/users - Danh sách users (search, filter, phân trang)
 * Query: ?page=1&limit=20&search=abc&roleId=2&isActive=true&includeDeleted=false
 */
adminUserRouter.get(
  "/",
  authenticate,
  authorize("ADMIN", "HRM"),
  UserController.getUsers,
);

/**
 * GET /admin/users/:id - Chi tiết user (bao gồm soft deleted)
 */
adminUserRouter.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HRM"),
  UserController.getUserById,
);

/**
 * POST /admin/users - Tạo user mới
 * Body: { name, email, password, username?, phoneNumber?, avatarUrl?, roleId? }
 */
adminUserRouter.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  adminCreateUserValidation,
  UserController.createUser,
);

/**
 * PATCH /admin/users/:id - Cập nhật user
 * Body: { name?, email?, username?, phoneNumber?, avatarUrl?, roleId?, isActive?, password? }
 */
adminUserRouter.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  adminUpdateUserValidation,
  UserController.updateUser,
);

/**
 * DELETE /admin/users/:id - Soft delete user
 */
adminUserRouter.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  UserController.deleteUser,
);

/**
 * PATCH /admin/users/:id/active - Kích hoạt/vô hiệu hóa user
 * Body: { isActive: true/false }
 */
adminUserRouter.patch(
  "/:id/active",
  authenticate,
  authorize("ADMIN"),
  toggleActiveValidation,
  UserController.toggleActive,
);
