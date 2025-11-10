import { body, param } from "express-validator";

export const updateInventoryValidation = [
  param("productId").isInt().withMessage("ID sản phẩm không hợp lệ"),

  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Số lượng phải là số nguyên không âm"),
];

export const checkInventoryValidation = [
  body("productIds")
    .isArray()
    .withMessage("Danh sách sản phẩm phải là một mảng")
    .notEmpty()
    .withMessage("Danh sách sản phẩm không được rỗng"),

  body("productIds.*").isInt().withMessage("ID sản phẩm không hợp lệ"),
];
