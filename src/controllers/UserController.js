import { validationResult } from "express-validator";
import * as UserService from "../services/UserService.js";

/**
 * Controller xử lý đăng ký
 */
export async function register(req, res, next) {
  try {
    // Kiểm tra validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userData = req.body;
    const user = await UserService.register(userData);

    res.status(201).json({
      message: "Đăng ký thành công",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller xử lý đăng nhập
 */
export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await UserService.login(email, password);

    res.json({
      message: "Đăng nhập thành công",
      data: result,
    });
  } catch (error) {
    res.json({
      error: "Đăng nhập thất bại",
      message: error.message,
    });
  }
}

/**
 * Controller lấy thông tin profile
 */
export async function getProfile(req, res, next) {
  try {
    const user = await UserService.getUserById(req.user.id);
    res.json({
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller cập nhật profile
 */
export async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await UserService.updateProfile(req.user.id, req.body);
    res.json({
      message: "Cập nhật thông tin thành công",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller đổi mật khẩu
 */
export async function changePassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

   const user = await UserService.changePassword(req.user.id, req.user.email, req.body);
    res.json({
      message: "Đổi mật khẩu thành công",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller lấy danh sách users (admin only)
 */
export async function getUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const result = await UserService.getAllUsers(page, limit);
    res.json({
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller cập nhật trạng thái user (admin only)
 */
export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await UserService.updateUserStatus(id, isActive);
    res.json({
      message: "Cập nhật trạng thái thành công",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller xem chi tiết user (admin only)
 */
export async function getUserDetail(req, res, next) {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy user",
      });
    }

    res.json({
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
