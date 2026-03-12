import express from "express";
import * as AuthController from "../controllers/AuthController.js";
import { authenticate } from "../middlewares/auth.js";
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  updateProfileValidation,
  changePasswordValidation,
} from "../middlewares/authValidation.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (Không cần authentication)
// ============================================

/**
 * POST /auth/register
 * Đăng ký tài khoản mới
 */
router.post("/register", registerValidation, AuthController.register);

/**
 * POST /auth/login
 * Đăng nhập với email/username + password
 * Response: user, accessToken, refreshToken
 */
router.post("/login", loginValidation, AuthController.login);

/**
 * POST /auth/refresh
 * Refresh access token bằng refresh token
 * Body: { refreshToken }
 * Response: accessToken, refreshToken (mới)
 */
router.post("/refresh", refreshTokenValidation, AuthController.refreshToken);

// ============================================
// PROTECTED ROUTES (Yêu cầu authentication)
// ============================================

/**
 * POST /auth/logout
 * Đăng xuất (revoke session hiện tại)
 * Header: Authorization: Bearer {accessToken}
 */
router.post("/logout", authenticate, AuthController.logout);

/**
 * POST /auth/logout-all
 * Đăng xuất khỏi tất cả thiết bị
 * Body: { keepCurrent: true/false } - true = giữ session hiện tại
 * Header: Authorization: Bearer {accessToken}
 */
router.post("/logout-all", authenticate, AuthController.logoutAllDevices);

/**
 * GET /auth/me
 * Lấy thông tin profile của user hiện tại (bao gồm role)
 * Header: Authorization: Bearer {accessToken}
 */
router.get("/me", authenticate, AuthController.getMe);

/**
 * PATCH /auth/me/profile
 * Cập nhật profile: name, phoneNumber, username, avatarUrl
 * Header: Authorization: Bearer {accessToken}
 */
router.patch(
  "/me/profile",
  authenticate,
  updateProfileValidation,
  AuthController.updateMyProfile,
);

/**
 * PATCH /auth/me/password
 * Đổi mật khẩu
 * Body: { currentPassword, newPassword, confirmPassword }
 * Header: Authorization: Bearer {accessToken}
 */
router.patch(
  "/me/password",
  authenticate,
  changePasswordValidation,
  AuthController.changeMyPassword,
);

/**
 * GET /auth/sessions
 * Lấy danh sách sessions (thiết bị đã đăng nhập)
 * Header: Authorization: Bearer {accessToken}
 */
router.get("/sessions", authenticate, AuthController.getSessions);

/**
 * DELETE /auth/sessions/:sessionId
 * Revoke session cụ thể (logout thiết bị khác)
 * Header: Authorization: Bearer {accessToken}
 */
router.delete(
  "/sessions/:sessionId",
  authenticate,
  AuthController.revokeSession,
);

export default router;
