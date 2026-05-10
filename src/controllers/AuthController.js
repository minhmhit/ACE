import { validationResult } from "express-validator";
import * as AuthService from "../services/AuthService.js";

/**
 * Extract device info từ request
 */
function getDeviceInfo(req) {
  return {
    ipAddress: req.ip || req.connection.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Unknown",
    deviceId: req.body.deviceId || null,
    deviceName:
      req.body.deviceName || req.headers["user-agent"] || "Unknown Device",
  };
}

/**
 * POST /auth/register
 * Đăng ký user mới
 */
export async function register(req, res, next) {
  try {
    // Kiểm tra validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }

    const userData = req.body;
    const user = await AuthService.register(userData);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Đăng ký thất bại",
      message: error.message,
    });
  }
}

/**
 * POST /auth/login
 * Đăng nhập với email/username và password
 */
export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    const deviceInfo = getDeviceInfo(req);

    const result = await AuthService.login(email, password, deviceInfo);

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Đăng nhập thất bại",
      message: error.message,
    });
  }
}

/**
 * POST /auth/refresh
 * Refresh access token bằng refresh token
 */
export async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token không được để trống",
      });
    }

    const deviceInfo = getDeviceInfo(req);

    const result = await AuthService.refreshAccessToken(
      refreshToken,
      deviceInfo,
    );

    res.json({
      success: true,
      message: "Refresh token thành công",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Refresh token thất bại",
      message: error.message,
    });
  }
}

/**
 * POST /auth/logout
 * Đăng xuất (revoke session hiện tại)
 * Yêu cầu: authenticated
 */
export async function logout(req, res, next) {
  try {
    const jti = req.user.jti; // From JWT payload, set by authenticate middleware

    await AuthService.logout(jti);

    res.json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Đăng xuất thất bại",
      message: error.message,
    });
  }
}

/**
 * POST /auth/logout-all
 * Đăng xuất khỏi tất cả thiết bị
 * Yêu cầu: authenticated
 */
export async function logoutAllDevices(req, res, next) {
  try {
    const userId = req.user.id;
    const currentJti = req.user.jti;

    // keepCurrent = true nghĩa là giữ session hiện tại
    const keepCurrent = req.body.keepCurrent === true;

    await AuthService.logoutAllDevices(userId, keepCurrent ? currentJti : null);

    res.json({
      success: true,
      message: keepCurrent
        ? "Đã đăng xuất khỏi tất cả thiết bị khác"
        : "Đã đăng xuất khỏi tất cả thiết bị",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Đăng xuất thất bại",
      message: error.message,
    });
  }
}

/**
 * GET /auth/me
 * Lấy thông tin profile của user hiện tại
 * Yêu cầu: authenticated
 */
export async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await AuthService.getProfile(userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: "Không tìm thấy user",
      message: error.message,
    });
  }
}

/**
 * PATCH /auth/me/profile
 * Cập nhật profile của user hiện tại
 * Yêu cầu: authenticated
 */
export async function updateMyProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const user = await AuthService.updateProfile(userId, req.body);

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Cập nhật thông tin thất bại",
      message: error.message,
    });
  }
}

/**
 * PATCH /auth/me/password
 * Đổi mật khẩu
 * Yêu cầu: authenticated
 */
export async function changeMyPassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    await AuthService.changePassword(userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Đổi mật khẩu thất bại",
      message: error.message,
    });
  }
}

/**
 * GET /auth/sessions
 * Lấy danh sách sessions (thiết bị đã đăng nhập)
 * Yêu cầu: authenticated
 */
export async function getSessions(req, res, next) {
  try {
    const userId = req.user.id;
    const currentJti = req.user.jti;

    let sessions = await AuthService.getUserSessions(userId);

    // Mark current session
    sessions = sessions.map((s) => ({
      ...s,
      isCurrent: s.jwtId === currentJti,
    }));

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lấy danh sách sessions thất bại",
      message: error.message,
    });
  }
}

/**
 * DELETE /auth/sessions/:sessionId
 * Revoke session cụ thể (logout thiết bị khác)
 * Yêu cầu: authenticated
 */
export async function revokeSession(req, res, next) {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    await AuthService.revokeSession(userId, parseInt(sessionId));

    res.json({
      success: true,
      message: "Đã revoke session thành công",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Revoke session thất bại",
      message: error.message,
    });
  }
}

/**
 * POST /auth/forgot-password
 * Reset mật khẩu bằng username → password = Sdt@123456
 */
export async function forgotPassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }

    const { username } = req.body;
    const result = await AuthService.resetPasswordByUsername(username);

    res.json({
      success: true,
      message: result.message,
      hint: result.hint,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Đặt lại mật khẩu thất bại",
      message: error.message,
    });
  }
}
