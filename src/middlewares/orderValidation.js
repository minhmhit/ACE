import { body } from "express-validator";

export const createOrderValidation = [
  body("couponId").optional().isInt().withMessage("Mã giảm giá không hợp lệ"),
];

export const updateOrderStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Trạng thái đơn hàng không được để trống")
    .isIn(["PENDING", "COMPLETED", "CANCELLED"])
    .withMessage("Trạng thái đơn hàng không hợp lệ"),
];
