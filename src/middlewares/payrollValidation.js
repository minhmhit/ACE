import { body, param, query } from "express-validator";

// ============================================
// PAYROLL VALIDATION
// ============================================

/**
 * Validation cho POST /payrolls/generate — Generate payroll
 */
export const generatePayrollValidation = [
  body("periodId")
    .notEmpty()
    .withMessage("ID kỳ lương là bắt buộc")
    .isInt({ min: 1 })
    .withMessage("periodId phải là số nguyên dương"),

  body("employeeId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("employeeId phải là số nguyên dương"),
];

/**
 * Validation cho POST /payrolls/finalize-period
 */
export const finalizePeriodValidation = [
  body("periodId")
    .notEmpty()
    .withMessage("ID kỳ lương là bắt buộc")
    .isInt({ min: 1 })
    .withMessage("periodId phải là số nguyên dương"),
];

/**
 * Validation param :id
 */
export const idParamValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID không hợp lệ"),
];
