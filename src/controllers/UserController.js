import { validationResult } from "express-validator";
import * as UserService from "../services/UserService.js";

// ============================================
// SELF-SERVICE
// ============================================

/**
 * GET /users/me
 * Lấy profile của user hiện tại
 */
export async function getMe(req, res, next) {
  try {
    const user = await UserService.getMe(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /users/me
 * User tự cập nhật profile: name, phoneNumber, username, avatarUrl
 */
export async function updateMe(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await UserService.updateMe(req.user.id, req.body);
    res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// ADMIN
// ============================================

/**
 * GET /admin/users
 * Admin lấy danh sách users (search, filter, phân trang)
 * Query: ?page=1&limit=20&search=abc&roleId=2&isActive=true&includeDeleted=false
 */
export async function getUsers(req, res, next) {
  try {
    const result = await UserService.adminGetUsers(req.query);
    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /admin/users/:id
 * Admin xem chi tiết user (bao gồm soft deleted)
 */
export async function getUserById(req, res, next) {
  try {
    const user = await UserService.adminGetUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /admin/users
 * Admin tạo user mới
 */
export async function createUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await UserService.adminCreateUser(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo user thành công",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /admin/users/:id
 * Admin cập nhật user (email, roleId, isActive, password, ...)
 */
export async function updateUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await UserService.adminUpdateUser(req.params.id, req.body);
    res.json({
      success: true,
      message: "Cập nhật user thành công",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /admin/users/:id
 * Admin soft delete user (set deletedAt, isActive=0)
 */
export async function deleteUser(req, res, next) {
  try {
    const result = await UserService.adminDeleteUser(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /admin/users/:id/active
 * Admin toggle active/inactive
 */
export async function toggleActive(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await UserService.adminToggleActive(
      req.params.id,
      req.body.isActive,
    );
    res.json({
      success: true,
      message: req.body.isActive
        ? "Kích hoạt user thành công"
        : "Vô hiệu hóa user thành công",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
