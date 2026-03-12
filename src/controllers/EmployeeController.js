import { validationResult } from "express-validator";
import * as EmployeeService from "../services/EmployeeService.js";

// ============================================
// SELF-SERVICE
// ============================================

/**
 * GET /employees/me — Nhân viên xem hồ sơ của mình
 */
export async function getMe(req, res, next) {
  try {
    const employee = await EmployeeService.getMe(req.user.id);
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /employees/me — Nhân viên tự cập nhật thông tin cá nhân
 */
export async function updateMe(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const employee = await EmployeeService.updateMe(req.user.id, req.body);
    res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// ADMIN / HRM
// ============================================

/**
 * GET /employees — Danh sách nhân viên
 * Query: ?page=1&limit=20&search=abc&status=ACTIVE&departmentId=1&employmentType=FULL_TIME
 */
export async function getAll(req, res, next) {
  try {
    const result = await EmployeeService.getAll(req.query);
    res.json({
      success: true,
      data: result.employees,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /employees/:id — Chi tiết nhân viên
 */
export async function getById(req, res, next) {
  try {
    const employee = await EmployeeService.getById(req.params.id);
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /employees — Tạo nhân viên mới (transaction user + employee + position_history)
 */
export async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const employee = await EmployeeService.create(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: "Tạo nhân viên thành công",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /employees/:id — Cập nhật thông tin nhân viên
 */
export async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const employee = await EmployeeService.update(req.params.id, req.body);
    res.json({
      success: true,
      message: "Cập nhật nhân viên thành công",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /employees/:id/status — Chuyển trạng thái nhân viên
 */
export async function changeStatus(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const employee = await EmployeeService.changeStatus(
      req.params.id,
      req.body.status,
      req.user.id,
    );
    res.json({
      success: true,
      message: `Chuyển trạng thái thành "${req.body.status}" thành công`,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /employees/:id/position — Đổi chức vụ / lương
 */
export async function changePosition(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const employee = await EmployeeService.changePosition(
      req.params.id,
      req.body,
      req.user.id,
    );
    res.json({
      success: true,
      message: "Đổi chức vụ thành công",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /employees/:id/position-history — Lịch sử chức vụ
 */
export async function getPositionHistory(req, res, next) {
  try {
    const history = await EmployeeService.getPositionHistory(req.params.id);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
}
