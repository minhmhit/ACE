import { body, param } from "express-validator";

// ============================================
// RESIGNATION REQUEST VALIDATION
// ============================================

/**
 * Validation cho POST /resignation-requests — Tạo đơn xin nghỉ việc
 */
export const createResignationRequestValidation = [
  body("desiredLastWorkingDate")
    .notEmpty()
    .withMessage("Ngày làm việc cuối cùng mong muốn là bắt buộc")
    .isDate()
    .withMessage("Ngày làm việc cuối cùng không hợp lệ (định dạng YYYY-MM-DD)"),

  body("reason")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Lý do nghỉ việc tối đa 500 ký tự"),
];

/**
 * Validation cho PATCH /resignation-requests/:id/reject — Từ chối đơn
 */
export const rejectResignationRequestValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ"),

  body("rejectedReason")
    .trim()
    .notEmpty()
    .withMessage("Lý do từ chối là bắt buộc")
    .isLength({ max: 255 })
    .withMessage("Lý do từ chối tối đa 255 ký tự"),
];
