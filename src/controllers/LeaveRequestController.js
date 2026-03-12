import { validationResult } from "express-validator";
import * as LeaveRequestService from "../services/LeaveRequestService.js";

// ===== SELF-SERVICE (nhân viên tự quản lý) =====

/**
 * GET /leave-requests/me — Lấy danh sách đơn nghỉ phép của mình
 * Query: ?status=PENDING&page=1&limit=10
 */
export async function getMyRequests(req, res, next) {
  try {
    const result = await LeaveRequestService.getMyLeaveRequests(
      req.user.id,
      req.query,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /leave-requests — Tạo đơn nghỉ phép
 */
export async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const leaveRequest = await LeaveRequestService.createLeaveRequest(
      req.user.id,
      req.body,
    );
    res.status(201).json({
      success: true,
      message: "Tạo đơn nghỉ phép thành công",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /leave-requests/:id/cancel — Nhân viên tự huỷ đơn
 */
export async function cancel(req, res, next) {
  try {
    const leaveRequest = await LeaveRequestService.cancelLeaveRequest(
      req.user.id,
      req.params.id,
    );
    res.json({
      success: true,
      message: "Đã huỷ đơn nghỉ phép",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
}

// ===== MANAGER / ADMIN / HRM =====

/**
 * GET /manager/leave-requests/pending — Danh sách đơn chờ duyệt
 * Query: ?page=1&limit=10
 */
export async function getPending(req, res, next) {
  try {
    const result = await LeaveRequestService.getPendingRequests(
      req.user.id,
      req.user.role.code,
      req.query,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /manager/leave-requests/:id/approve — Duyệt đơn
 */
export async function approve(req, res, next) {
  try {
    const leaveRequest = await LeaveRequestService.approveLeaveRequest(
      req.user.id,
      req.params.id,
    );
    res.json({
      success: true,
      message: "Đã duyệt đơn nghỉ phép",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /manager/leave-requests/:id/reject — Từ chối đơn
 */
export async function reject(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const leaveRequest = await LeaveRequestService.rejectLeaveRequest(
      req.user.id,
      req.params.id,
      req.body.rejectedReason,
    );
    res.json({
      success: true,
      message: "Đã từ chối đơn nghỉ phép",
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
}
