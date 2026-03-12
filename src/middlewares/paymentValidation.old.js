import { body } from "express-validator";

/**
 * Validation cho API tạo thanh toán VNPay
 */
export const createVnpayPaymentValidation = [
  body("orderId")
    .notEmpty()
    .withMessage("orderId không được để trống")
    .isInt({ min: 1 })
    .withMessage("orderId phải là số nguyên dương"),

  body("orderInfo")
    .optional()
    .isString()
    .withMessage("orderInfo phải là chuỗi")
    .isLength({ max: 255 })
    .withMessage("orderInfo không được vượt quá 255 ký tự"),

  body("locale")
    .optional()
    .isIn(["vn", "en"])
    .withMessage("locale chỉ được là 'vn' hoặc 'en'"),
];

/**
 * Validation cho API query transaction
 */
export const queryTransactionValidation = [
  body("transactionDate")
    .optional()
    .matches(/^\d{14}$/)
    .withMessage("transactionDate phải có định dạng yyyyMMddHHmmss"),
];
