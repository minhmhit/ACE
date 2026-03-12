import { validationResult } from "express-validator";
import * as DepartmentService from "../services/DepartmentService.js";

/**
 * GET /departments
 * Query: ?page=1&limit=20&search=abc&isActive=true
 */
export async function getAll(req, res, next) {
  try {
    const result = await DepartmentService.getAll(req.query);
    res.json({
      success: true,
      data: result.departments,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /departments/:id
 */
export async function getById(req, res, next) {
  try {
    const dept = await DepartmentService.getById(req.params.id);
    res.json({ success: true, data: dept });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /departments
 */
export async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const dept = await DepartmentService.create(req.body);
    res
      .status(201)
      .json({ success: true, message: "Tạo phòng ban thành công", data: dept });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /departments/:id
 */
export async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const dept = await DepartmentService.update(req.params.id, req.body);
    res.json({
      success: true,
      message: "Cập nhật phòng ban thành công",
      data: dept,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /departments/:id/active
 */
export async function toggleActive(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const dept = await DepartmentService.toggleActive(
      req.params.id,
      req.body.isActive,
    );
    res.json({
      success: true,
      message: req.body.isActive
        ? "Kích hoạt phòng ban thành công"
        : "Vô hiệu hóa phòng ban thành công",
      data: dept,
    });
  } catch (error) {
    next(error);
  }
}
