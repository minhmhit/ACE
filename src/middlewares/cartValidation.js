import { body } from "express-validator";

export const addToCartValidation = [
  body("productId")
    .notEmpty()
    .withMessage("ID sản phẩm không được để trống")
    .isInt()
    .withMessage("ID sản phẩm không hợp lệ"),

  body("quantity")
    .notEmpty()
    .withMessage("Số lượng không được để trống")
    .isInt({ min: 1 })
    .withMessage("Số lượng phải là số nguyên dương"),

  body("variantId").optional().isInt().withMessage("ID biến thể không hợp lệ"),
];

export const updateCartItemValidation = [
  body("quantity")
    .notEmpty()
    .withMessage("Số lượng không được để trống")
    .isInt({ min: 1 })
    .withMessage("Số lượng phải là số nguyên dương"),
];
