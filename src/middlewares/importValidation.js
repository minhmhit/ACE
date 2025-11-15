import { body } from "express-validator";

export const createImportValidation = [
  body("importData.supplier_id")
    .notEmpty()
    .withMessage("ID nhà cung cấp không được để trống")
    .isInt()
    .withMessage("ID nhà cung cấp phải là số nguyên"),

  body("importData.payment_status")
    .optional()
    .isIn(["pending", "paid", "cancelled"])
    .withMessage("Trạng thái thanh toán không hợp lệ"),

  body("details")
    .isArray()
    .withMessage("Chi tiết nhập hàng phải là một mảng")
    .notEmpty()
    .withMessage("Phải có ít nhất một sản phẩm"),

  body("details.*.product_id")
    .notEmpty()
    .withMessage("ID sản phẩm không được để trống")
    .isInt()
    .withMessage("ID sản phẩm phải là số nguyên"),

  body("details.*.quantity")
    .notEmpty()
    .withMessage("Số lượng không được để trống")
    .isInt({ min: 1 })
    .withMessage("Số lượng phải là số nguyên dương"),

  body("details.*.unit_price")
    .notEmpty()
    .withMessage("Đơn giá không được để trống")
    .isFloat({ min: 0.01 })
    .withMessage("Đơn giá phải lớn hơn 0"),
];

export const updatePaymentStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Trạng thái thanh toán không được để trống")
    
];
