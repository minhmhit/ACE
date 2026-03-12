import { body, param, query } from "express-validator";

// Validate tạo payment
export const createPaymentValidation = [
  body("orderId")
    .notEmpty()
    .withMessage("Mã đơn hàng không được để trống")
    .isInt({ min: 1 })
    .withMessage("Mã đơn hàng không hợp lệ"),

  body("paymentMethodCode")
    .notEmpty()
    .withMessage("Phương thức thanh toán không được để trống")
    .isIn(["CASH", "CARD", "MOMO", "VNPAY", "PAYPAL"])
    .withMessage(
      "Phương thức thanh toán không hợp lệ (CASH, CARD, MOMO, VNPAY, PAYPAL)",
    ),

  // VNPay optional fields
  body("orderInfo")
    .optional()
    .isString()
    .withMessage("Thông tin đơn hàng không hợp lệ"),

  body("locale")
    .optional()
    .isIn(["vn", "en"])
    .withMessage("Locale không hợp lệ (vn, en)"),

  // Card optional fields
  body("cardType")
    .optional()
    .isIn(["VISA", "MASTERCARD"])
    .withMessage("Loại thẻ không hợp lệ (VISA, MASTERCARD)"),

  body("last4Digits")
    .optional()
    .matches(/^\d{4}$/)
    .withMessage("4 số cuối thẻ phải là 4 chữ số"),

  body("cardHolderName")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Tên chủ thẻ không hợp lệ"),

  body("bankName")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Tên ngân hàng không hợp lệ"),
];

// Validate query danh sách payments
export const getPaymentsValidation = [
  query("status")
    .optional()
    .isIn(["PENDING", "SUCCESS", "FAILED", "REFUNDED"])
    .withMessage("Trạng thái không hợp lệ"),

  query("paymentMethodCode")
    .optional()
    .isIn(["CASH", "CARD", "MOMO", "VNPAY", "PAYPAL"])
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

// Validate payment id param
export const paymentIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID thanh toán không hợp lệ"),
];

// Validate order id param
export const orderIdValidation = [
  param("orderId").isInt({ min: 1 }).withMessage("ID đơn hàng không hợp lệ"),
];
