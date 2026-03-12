import { validationResult } from "express-validator";
import * as PayrollPeriodService from "../services/PayrollPeriodService.js";

/**
 * GET /payroll-periods — Danh sách kỳ lương
 */
export async function getAll(req, res, next) {
  try {
    const result = await PayrollPeriodService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /payroll-periods/:id — Chi tiết kỳ lương
 */
export async function getById(req, res, next) {
  try {
    const period = await PayrollPeriodService.getById(req.params.id);
    res.json({ success: true, data: period });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /payroll-periods — Tạo kỳ lương mới
 */
export async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const period = await PayrollPeriodService.create(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo kỳ lương thành công",
      data: period,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /payroll-periods/:id — Cập nhật kỳ lương
 */
export async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const period = await PayrollPeriodService.update(req.params.id, req.body);
    res.json({
      success: true,
      message: "Cập nhật kỳ lương thành công",
      data: period,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /payroll-periods/:id/lock — Khoá sổ kỳ lương
 */
export async function lockPeriod(req, res, next) {
  try {
    const period = await PayrollPeriodService.lockPeriod(req.params.id);
    res.json({
      success: true,
      message: "Khoá sổ kỳ lương thành công",
      data: period,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /payroll-periods/:id/mark-paid — Đánh dấu đã trả lương
 */
export async function markPaid(req, res, next) {
  try {
    const period = await PayrollPeriodService.markPaid(req.params.id, req.body);
    res.json({
      success: true,
      message: "Đánh dấu đã trả lương thành công",
      data: period,
    });
  } catch (error) {
    next(error);
  }
}
