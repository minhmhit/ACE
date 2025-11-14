import { body } from "express-validator";

export const createOrderValidation = [
  body("cartItems")
    .isArray({ min: 1 })
    .withMessage("Danh sách sản phẩm phải là mảng và không được rỗng"),

  body("cartItems.*.cartItemId")
    .isInt({ min: 1 })
    .withMessage("ID cart item không hợp lệ"),

  body("cartItems.*.productId")
    .isInt({ min: 1 })
    .withMessage("ID sản phẩm không hợp lệ"),

  body("cartItems.*.variantId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("ID biến thể không hợp lệ"),

  body("cartItems.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Số lượng phải là số nguyên dương"),

  body("shipAddress")
    .optional({ nullable: true })
    .isString()
    .withMessage("Địa chỉ giao hàng không hợp lệ"),

  body("couponId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Mã giảm giá không hợp lệ"),
];

export const updateOrderStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Trạng thái đơn hàng không được để trống")
    .isIn(["PENDING", "COMPLETED", "CANCELLED"])
    .withMessage("Trạng thái đơn hàng không hợp lệ"),
];
