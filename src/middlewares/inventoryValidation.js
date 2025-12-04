import { body, param, query } from "express-validator";

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

export const lowStockValidation = [
  query("threshold")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Ngưỡng tồn kho phải là số nguyên lớn hơn 0"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Số trang phải là số nguyên lớn hơn 0"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Giới hạn phải từ 1 đến 100"),
];
