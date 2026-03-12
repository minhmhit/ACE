import { body, param } from "express-validator";

// ============================================
// PAYROLL PERIOD VALIDATION
// ============================================

/**
 * Validation cho POST /payroll-periods — Tạo kỳ lương
 */
export const createPayrollPeriodValidation = [
  body("monthNo")
    .notEmpty()
    .withMessage("Tháng là bắt buộc")
    .isInt({ min: 1, max: 12 })
    .withMessage("Tháng phải từ 1 đến 12"),

  body("yearNo")
    .notEmpty()
    .withMessage("Năm là bắt buộc")
    .isInt({ min: 2020, max: 2100 })
    .withMessage("Năm phải từ 2020 đến 2100"),

  body("startDate")
    .notEmpty()
    .withMessage("Ngày bắt đầu là bắt buộc")
    .isDate()
    .withMessage("Ngày bắt đầu không hợp lệ (định dạng YYYY-MM-DD)"),

  body("endDate")
    .notEmpty()
    .withMessage("Ngày kết thúc là bắt buộc")
    .isDate()
    .withMessage("Ngày kết thúc không hợp lệ (định dạng YYYY-MM-DD)"),

  body("paymentDate")
    .optional({ nullable: true })
    .isDate()
    .withMessage("Ngày trả lương không hợp lệ (định dạng YYYY-MM-DD)"),
];

/**
 * Validation cho PATCH /payroll-periods/:id — Cập nhật kỳ lương
 */
export const updatePayrollPeriodValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ"),

  body("startDate")
    .optional()
    .isDate()
    .withMessage("Ngày bắt đầu không hợp lệ (định dạng YYYY-MM-DD)"),

  body("endDate")
    .optional()
    .isDate()
    .withMessage("Ngày kết thúc không hợp lệ (định dạng YYYY-MM-DD)"),

  body("paymentDate")
    .optional({ nullable: true })
    .isDate()
    .withMessage("Ngày trả lương không hợp lệ (định dạng YYYY-MM-DD)"),
];

/**
 * Validation cho PATCH /payroll-periods/:id/mark-paid
 */
export const markPaidValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ"),

  body("paymentDate")
    .optional()
    .isDate()
    .withMessage("Ngày trả lương không hợp lệ (định dạng YYYY-MM-DD)"),
];

/**
 * Validation param :id cho các route cần id
 */
export const idParamValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ"),
];
