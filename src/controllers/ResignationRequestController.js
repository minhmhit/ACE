import { validationResult } from "express-validator";
import * as ResignationRequestService from "../services/ResignationRequestService.js";

// ===== SELF-SERVICE (nhân viên tự quản lý) =====

/**
 * GET /resignation-requests/me — Lấy danh sách đơn nghỉ việc của mình
 * Query: ?status=PENDING&page=1&limit=10
 */
export async function getMyRequests(req, res, next) {
  try {
    const result = await ResignationRequestService.getMyResignationRequests(
      req.user.id,
      req.query,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /resignation-requests — Tạo đơn xin nghỉ việc
 */
export async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const resignationRequest =
      await ResignationRequestService.createResignationRequest(
        req.user.id,
        req.body,
      );
    res.status(201).json({
      success: true,
      message: "Tạo đơn xin nghỉ việc thành công",
      data: resignationRequest,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /resignation-requests/:id/cancel — Nhân viên tự huỷ đơn
 */
export async function cancel(req, res, next) {
  try {
    const resignationRequest =
      await ResignationRequestService.cancelResignationRequest(
        req.user.id,
        req.params.id,
      );
    res.json({
      success: true,
      message: "Đã huỷ đơn nghỉ việc",
      data: resignationRequest,
    });
  } catch (error) {
    next(error);
  }
}

// ===== ADMIN / HRM =====

/**
 * GET /resignation-requests/pending — Danh sách đơn chờ duyệt
 * Query: ?page=1&limit=10
 */
export async function getPending(req, res, next) {
  try {
    const result = await ResignationRequestService.getPendingRequests(
      req.query,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /resignation-requests/:id/approve — Duyệt đơn nghỉ việc
 */
export async function approve(req, res, next) {
  try {
    const resignationRequest =
      await ResignationRequestService.approveResignationRequest(
        req.user.id,
        req.params.id,
      );
    res.json({
      success: true,
      message: "Đã duyệt đơn nghỉ việc",
      data: resignationRequest,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /resignation-requests/:id/reject — Từ chối đơn nghỉ việc
 */
export async function reject(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const resignationRequest =
      await ResignationRequestService.rejectResignationRequest(
        req.user.id,
        req.params.id,
        req.body.rejectedReason,
      );
    res.json({
      success: true,
      message: "Đã từ chối đơn nghỉ việc",
      data: resignationRequest,
    });
  } catch (error) {
    next(error);
  }
}
