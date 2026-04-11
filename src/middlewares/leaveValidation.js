import { body, param } from "express-validator";

export const createLeaveTypeValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Ma loai nghi phep la bat buoc")
    .isLength({ max: 50 })
    .withMessage("Ma loai nghi phep toi da 50 ky tu")
    .matches(/^[A-Z0-9_]+$/)
    .withMessage("Ma loai nghi phep chi chua chu in hoa, so va dau gach duoi"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Ten loai nghi phep la bat buoc")
    .isLength({ max: 100 })
    .withMessage("Ten loai nghi phep toi da 100 ky tu"),

  body("isPaid").optional().isBoolean().withMessage("isPaid phai la boolean"),

  body("requiresAttachment")
    .optional()
    .isBoolean()
    .withMessage("requiresAttachment phai la boolean"),

  body("maxDaysPerYear")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("maxDaysPerYear phai la so nguyen duong"),

  body("isActive").optional().isBoolean().withMessage("isActive phai la boolean"),
];

export const updateLeaveTypeValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID khong hop le"),

  body("code")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Ma loai nghi phep toi da 50 ky tu")
    .matches(/^[A-Z0-9_]+$/)
    .withMessage("Ma loai nghi phep chi chua chu in hoa, so va dau gach duoi"),

  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Ten loai nghi phep toi da 100 ky tu"),

  body("isPaid").optional().isBoolean().withMessage("isPaid phai la boolean"),

  body("requiresAttachment")
    .optional()
    .isBoolean()
    .withMessage("requiresAttachment phai la boolean"),

  body("maxDaysPerYear")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("maxDaysPerYear phai la so nguyen duong"),

  body("isActive").optional().isBoolean().withMessage("isActive phai la boolean"),
];

export const createLeaveRequestValidation = [
  body("leaveTypeId")
    .notEmpty()
    .withMessage("Loai nghi phep la bat buoc")
    .isInt({ min: 1 })
    .withMessage("leaveTypeId phai la so nguyen duong"),

  body("requestType")
    .optional({ nullable: true })
    .trim()
    .isIn([
      "ANNUAL_LEAVE",
      "SICK_LEAVE",
      "MATERNITY_LEAVE",
      "UNPAID_LEAVE",
      "OTHER",
    ])
    .withMessage(
      "requestType phai la mot trong: ANNUAL_LEAVE, SICK_LEAVE, MATERNITY_LEAVE, UNPAID_LEAVE, OTHER",
    ),

  body("startDate")
    .notEmpty()
    .withMessage("Ngay bat dau la bat buoc")
    .isDate()
    .withMessage("Ngay bat dau khong hop le (YYYY-MM-DD)"),

  body("endDate")
    .notEmpty()
    .withMessage("Ngay ket thuc la bat buoc")
    .isDate()
    .withMessage("Ngay ket thuc khong hop le (YYYY-MM-DD)"),

  body("totalDays")
    .notEmpty()
    .withMessage("Tong so ngay nghi la bat buoc")
    .isFloat({ min: 0.5 })
    .withMessage("Tong so ngay nghi phai >= 0.5"),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Ly do nghi phep la bat buoc")
    .isLength({ max: 500 })
    .withMessage("Ly do toi da 500 ky tu"),

  body("attachmentUrl")
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage("URL dinh kem khong hop le"),
];

export const rejectLeaveRequestValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID khong hop le"),

  body("rejectedReason")
    .trim()
    .notEmpty()
    .withMessage("Ly do tu choi la bat buoc")
    .isLength({ max: 500 })
    .withMessage("Ly do tu choi toi da 500 ky tu"),
];
