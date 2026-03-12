import { validationResult } from "express-validator";
import * as AttendanceService from "../services/AttendanceService.js";

// ===== SELF-SERVICE (nhân viên) =====

/**
 * POST /attendance/check-in — Nhân viên check-in
 */
export async function checkIn(req, res, next) {
  try {
    const attendance = await AttendanceService.checkIn(req.user.id);
    res.status(201).json({
      success: true,
      message: "Check-in thành công",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /attendance/check-out — Nhân viên check-out
 */
export async function checkOut(req, res, next) {
  try {
    const attendance = await AttendanceService.checkOut(req.user.id);
    res.json({
      success: true,
      message: "Check-out thành công",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /attendance/me — Lịch sử chấm công của mình
 * Query: ?month=3&year=2026
 */
export async function getMyAttendance(req, res, next) {
  try {
    const result = await AttendanceService.getMyAttendance(
      req.user.id,
      req.query,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

// ===== ADMIN / HRM =====

/**
 * GET /attendance — Xem chấm công nhân viên
 * Query: ?month=3&year=2026&employeeId=5&page=1&limit=50
 */
export async function getAll(req, res, next) {
  try {
    const result = await AttendanceService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /attendance/manual — Tạo bản ghi chấm công thủ công
 */
export async function createManual(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const attendance = await AttendanceService.createManual(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo bản ghi chấm công thành công",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /attendance/:id — Sửa bản ghi chấm công
 */
export async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const attendance = await AttendanceService.updateAttendance(
      req.params.id,
      req.body,
    );
    res.json({
      success: true,
      message: "Cập nhật bản ghi chấm công thành công",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
}
