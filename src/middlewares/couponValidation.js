import { body } from "express-validator";

export const createCouponValidation = [
  body("code")
    .notEmpty()
    .withMessage("Mã giảm giá không được để trống")
    .isString()
    .withMessage("Mã giảm giá phải là chuỗi")
    .matches(/^[A-Z0-9-]+$/)
    .withMessage("Mã giảm giá chỉ chấp nhận chữ in hoa, số và dấu gạch ngang")
    .isLength({ min: 3, max: 20 })
    .withMessage("Mã giảm giá phải từ 3-20 ký tự"),

  body("discountPercent")
    .notEmpty()
    .withMessage("Phần trăm giảm giá không được để trống")
    .isFloat({ min: 0.1, max: 100 })
    .withMessage("Phần trăm giảm giá phải từ 0.1 đến 100"),

  body("validFrom")
    .notEmpty()
    .withMessage("Ngày bắt đầu không được để trống")
    .isISO8601()
    .withMessage("Ngày bắt đầu không hợp lệ")
    .toDate(),

  body("validUntil")
    .notEmpty()
    .withMessage("Ngày kết thúc không được để trống")
    .isISO8601()
    .withMessage("Ngày kết thúc không hợp lệ")
    .toDate(),
];

export const updateCouponValidation = [
  body("code")
    .optional()
    .isString()
    .withMessage("Mã giảm giá phải là chuỗi")
    .matches(/^[A-Z0-9-]+$/)
    .withMessage("Mã giảm giá chỉ chấp nhận chữ in hoa, số và dấu gạch ngang")
    .isLength({ min: 3, max: 20 })
    .withMessage("Mã giảm giá phải từ 3-20 ký tự"),
  body("discountPercent")
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage("Phần trăm giảm giá phải từ 0.1 đến 100"),
  body("validFrom")
    .optional()
    .isISO8601()
    .withMessage("Ngày bắt đầu không hợp lệ")
    .toDate(),
  body("validUntil")
    .optional()
    .isISO8601()
    .withMessage("Ngày kết thúc không hợp lệ")
    .toDate(),
];

export const verifyCouponValidation = [
  body("code")
    .notEmpty()
    .withMessage("Mã giảm giá không được để trống")
    .isString()
    .withMessage("Mã giảm giá phải là chuỗi")
    .matches(/^[A-Z0-9-]+$/)
    .withMessage("Mã giảm giá chỉ chấp nhận chữ in hoa, số và dấu gạch ngang"),
];
