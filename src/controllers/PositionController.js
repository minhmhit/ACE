import { validationResult } from "express-validator";
import * as PositionService from "../services/PositionService.js";

/**
 * GET /positions
 * Query: ?page=1&limit=20&search=abc&isActive=true
 */
export async function getAll(req, res, next) {
  try {
    const result = await PositionService.getAll(req.query);
    res.json({
      success: true,
      data: result.positions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /positions/:id
 */
export async function getById(req, res, next) {
  try {
    const pos = await PositionService.getById(req.params.id);
    res.json({ success: true, data: pos });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /positions
 */
export async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const pos = await PositionService.create(req.body);
    res
      .status(201)
      .json({ success: true, message: "Tạo chức vụ thành công", data: pos });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /positions/:id
 */
export async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const pos = await PositionService.update(req.params.id, req.body);
    res.json({
      success: true,
      message: "Cập nhật chức vụ thành công",
      data: pos,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /positions/:id/active
 */
export async function toggleActive(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const pos = await PositionService.toggleActive(
      req.params.id,
      req.body.isActive,
    );
    res.json({
      success: true,
      message: req.body.isActive
        ? "Kích hoạt chức vụ thành công"
        : "Vô hiệu hóa chức vụ thành công",
      data: pos,
    });
  } catch (error) {
    next(error);
  }
}
