import { body, param } from "express-validator";

export const createAddressValidation = [
  body("receiverName")
    .trim()
    .notEmpty()
    .withMessage("receiverName không được để trống")
    .isLength({ min: 2, max: 100 })
    .withMessage("receiverName phải từ 2-100 ký tự"),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("phoneNumber không được để trống")
    .isLength({ min: 8, max: 15 })
    .withMessage("phoneNumber phải từ 8-15 ký tự"),

  body("fullAddress")
    .trim()
    .notEmpty()
    .withMessage("fullAddress không được để trống"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault phải là boolean"),

  body("addressType")
    .optional()
    .isIn(["home", "office"])
    .withMessage("addressType chỉ nhận home hoặc office"),
];

export const updateAddressValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID địa chỉ không hợp lệ"),

  body("receiverName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("receiverName phải từ 2-100 ký tự"),

  body("phoneNumber")
    .optional()
    .trim()
    .isLength({ min: 8, max: 15 })
    .withMessage("phoneNumber phải từ 8-15 ký tự"),

  body("fullAddress")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("fullAddress không hợp lệ"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault phải là boolean"),

  body("addressType")
    .optional()
    .isIn(["home", "office"])
    .withMessage("addressType chỉ nhận home hoặc office"),
];

export const addressIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID địa chỉ không hợp lệ"),
];
