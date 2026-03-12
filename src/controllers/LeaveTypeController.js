import { validationResult } from "express-validator";
import * as LeaveTypeService from "../services/LeaveTypeService.js";

/**
 * GET /leave-types — Danh sách loại nghỉ phép
 * Query: ?isActive=true
 */
export async function getAll(req, res, next) {
  try {
    const leaveTypes = await LeaveTypeService.getAll(req.query);
    res.json({ success: true, data: leaveTypes });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /leave-types — Tạo loại nghỉ phép mới
 */
export async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const leaveType = await LeaveTypeService.create(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo loại nghỉ phép thành công",
      data: leaveType,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /leave-types/:id — Cập nhật loại nghỉ phép
 */
export async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const leaveType = await LeaveTypeService.update(req.params.id, req.body);
    res.json({
      success: true,
      message: "Cập nhật loại nghỉ phép thành công",
      data: leaveType,
    });
  } catch (error) {
    next(error);
  }
}
