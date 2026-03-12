import { body, param } from "express-validator";

// ============================================
// ATTENDANCE VALIDATION
// ============================================

const VALID_STATUSES = [
  "PRESENT",
  "ABSENT",
  "PAID_LEAVE",
  "UNPAID_LEAVE",
  "SICK_LEAVE",
  "MATERNITY_LEAVE",
  "HOLIDAY",
];

/**
 * Validation cho POST /attendance/manual — Tạo bản ghi thủ công
 */
export const createManualValidation = [
  body("employeeId")
    .notEmpty()
    .withMessage("ID nhân viên là bắt buộc")
    .isInt({ min: 1 })
    .withMessage("employeeId phải là số nguyên dương"),

  body("workDate")
    .notEmpty()
    .withMessage("Ngày làm việc là bắt buộc")
    .isDate()
    .withMessage("Ngày làm việc không hợp lệ (định dạng YYYY-MM-DD)"),

  body("status")
    .notEmpty()
    .withMessage("Trạng thái là bắt buộc")
    .isIn(VALID_STATUSES)
    .withMessage(`Status phải là một trong: ${VALID_STATUSES.join(", ")}`),

  body("checkIn")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("check-in phải là datetime hợp lệ (ISO 8601)"),

  body("checkOut")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("check-out phải là datetime hợp lệ (ISO 8601)"),

  body("note")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Ghi chú tối đa 255 ký tự"),
];

/**
 * Validation cho PATCH /attendance/:id — Sửa bản ghi chấm công
 */
export const updateAttendanceValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ"),

  body("status")
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status phải là một trong: ${VALID_STATUSES.join(", ")}`),

  body("checkIn")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("check-in phải là datetime hợp lệ (ISO 8601)"),

  body("checkOut")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("check-out phải là datetime hợp lệ (ISO 8601)"),

  body("note")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Ghi chú tối đa 255 ký tự"),
];
