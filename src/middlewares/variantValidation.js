import { body } from "express-validator";

export const createVariantValidation = [
  body("name")
    .notEmpty()
    .withMessage("Tên biến thể không được để trống")
    .isString()
    .withMessage("Tên biến thể phải là chuỗi")
    .trim(),

  body("productId")
    .notEmpty()
    .withMessage("ID sản phẩm không được để trống")
    .isInt()
    .withMessage("ID sản phẩm phải là số nguyên"),

  body("additionalPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Giá thêm phải là số không âm"),
];

export const updateVariantValidation = [
  body("name")
    .notEmpty()
    .withMessage("Tên biến thể không được để trống")
    .isString()
    .withMessage("Tên biến thể phải là chuỗi")
    .trim(),

  body("additionalPrice")
    .notEmpty()
    .withMessage("Giá thêm không được để trống")
    .isFloat({ min: 0 })
    .withMessage("Giá thêm phải là số không âm"),
];
