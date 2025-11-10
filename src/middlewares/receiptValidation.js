import { body } from "express-validator";

export const createReceiptValidation = [
  body("amount")
    .notEmpty()
    .withMessage("Số tiền không được để trống")
    .isFloat({ min: 0.01 })
    .withMessage("Số tiền phải lớn hơn 0"),

  body("order_id")
    .notEmpty()
    .withMessage("ID đơn hàng không được để trống")
    .isInt()
    .withMessage("ID đơn hàng phải là số nguyên"),

  body("payment_method")
    .notEmpty()
    .withMessage("Phương thức thanh toán không được để trống")
    .isIn(["cash", "bank_transfer", "credit_card", "momo"])
    .withMessage("Phương thức thanh toán không hợp lệ"),

  body("description")
    .optional()
    .isString()
    .withMessage("Ghi chú phải là chuỗi")
    .trim(),
];

export const updateReceiptValidation = [
  body("description")
    .notEmpty()
    .withMessage("Ghi chú không được để trống")
    .isString()
    .withMessage("Ghi chú phải là chuỗi")
    .trim(),
];
