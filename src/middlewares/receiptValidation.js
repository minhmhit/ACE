import { param, query } from "express-validator";

// Validate receipt id param
export const receiptIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID biên nhận không hợp lệ"),
];

// Validate order id param cho receipts
export const receiptOrderIdValidation = [
  param("orderId").isInt({ min: 1 }).withMessage("ID đơn hàng không hợp lệ"),
];

// Validate query danh sách receipts
export const getReceiptsValidation = [
  query("orderId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID đơn hàng không hợp lệ"),

  query("paymentMethod")
    .optional()
    .isIn(["cash", "bank_transfer", "credit_card", "momo", "vnpay", "paypal"])
    .withMessage("Phương thức thanh toán không hợp lệ"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Trang phải là số nguyên dương"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Số lượng mỗi trang từ 1-100"),
];
