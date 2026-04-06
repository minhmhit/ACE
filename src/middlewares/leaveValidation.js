import { body, param } from "express-validator";

// ============================================
// LEAVE TYPE VALIDATION
// ============================================

/**
 * Validation cho POST /leave-types — Tạo loại nghỉ phép
 */
export const createLeaveTypeValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Mã loại nghỉ phép là bắt buộc")
    .isLength({ max: 50 })
    .withMessage("Mã loại nghỉ phép tối đa 50 ký tự")
    .matches(/^[A-Z0-9_]+$/)
    .withMessage("Mã loại nghỉ phép chỉ chứa chữ in hoa, số và dấu gạch dưới"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên loại nghỉ phép là bắt buộc")
    .isLength({ max: 100 })
    .withMessage("Tên loại nghỉ phép tối đa 100 ký tự"),

  body("isPaid").optional().isBoolean().withMessage("isPaid phải là boolean"),

  body("requiresAttachment")
    .optional()
    .isBoolean()
    .withMessage("requiresAttachment phải là boolean"),

  body("maxDaysPerYear")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("maxDaysPerYear phải là số nguyên dương"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là boolean"),
];

/**
 * Validation cho PATCH /leave-types/:id — Cập nhật loại nghỉ phép
 */
export const updateLeaveTypeValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ"),

  body("code")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Mã loại nghỉ phép tối đa 50 ký tự")
    .matches(/^[A-Z0-9_]+$/)
    .withMessage("Mã loại nghỉ phép chỉ chứa chữ in hoa, số và dấu gạch dưới"),

  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Tên loại nghỉ phép tối đa 100 ký tự"),

  body("isPaid").optional().isBoolean().withMessage("isPaid phải là boolean"),

  body("requiresAttachment")
    .optional()
    .isBoolean()
    .withMessage("requiresAttachment phải là boolean"),

  body("maxDaysPerYear")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("maxDaysPerYear phải là số nguyên dương"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là boolean"),
];

// ============================================
// LEAVE REQUEST VALIDATION
// ============================================

/**
 * Validation cho POST /leave-requests — Tạo đơn nghỉ phép
 */
export const createLeaveRequestValidation = [
  body("leaveTypeId")
    .notEmpty()
    .withMessage("Loại nghỉ phép là bắt buộc")
    .isInt({ min: 1 })
    .withMessage("leaveTypeId phải là số nguyên dương"),
  //lấy loại yêu cầu mới cập nhật
  /*
- transaction
- trigger
 */
  body("requestType")
    .notEmpty()
    .withMessage("Loại yêu cầu là bắt buộc")
    .isIn([
      "FULL_DAY",
      "HALF_DAY_MORNING",
      "HALF_DAY_AFTERNOON",
      "MULTIPLE_DAYS",
      "ANNUAL_LEAVE",
      "SICK_LEAVE",
      "MATERNITY_LEAVE",
      "UNPAID_LEAVE",
      "OTHER",
    ])
    .withMessage(
      "requestType phải là một trong: FULL_DAY, HALF_DAY_MORNING, HALF_DAY_AFTERNOON, MULTIPLE_DAYS,SICK_LEAVE, MATERNITY_LEAVE, UNPAID_LEAVE, OTHER",
    ),

  body("startDate")
    .notEmpty()
    .withMessage("Ngày bắt đầu là bắt buộc")
    .isDate()
    .withMessage("Ngày bắt đầu không hợp lệ (YYYY-MM-DD)"),

  body("endDate")
    .notEmpty()
    .withMessage("Ngày kết thúc là bắt buộc")
    .isDate()
    .withMessage("Ngày kết thúc không hợp lệ (YYYY-MM-DD)"),

  body("totalDays")
    .notEmpty()
    .withMessage("Tổng số ngày nghỉ là bắt buộc")
    .isFloat({ min: 0.5 })
    .withMessage("Tổng số ngày nghỉ phải >= 0.5"),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Lý do nghỉ phép là bắt buộc")
    .isLength({ max: 500 })
    .withMessage("Lý do tối đa 500 ký tự"),

  body("attachmentUrl")
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage("URL đính kèm không hợp lệ"),
];

/**
 * Validation cho PATCH /manager/leave-requests/:id/reject — Từ chối đơn
 */
export const rejectLeaveRequestValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ"),

  body("rejectedReason")
    .trim()
    .notEmpty()
    .withMessage("Lý do từ chối là bắt buộc")
    .isLength({ max: 500 })
    .withMessage("Lý do từ chối tối đa 500 ký tự"),
];
