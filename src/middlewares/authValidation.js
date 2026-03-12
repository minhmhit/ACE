import { body } from "express-validator";

/**
 * Validation cho register
 */
export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên không được để trống")
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên phải có từ 2-100 ký tự"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),

  body("username")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username phải có từ 3-50 ký tự")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username chỉ chứa chữ cái, số và dấu gạch dưới"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu không được để trống")
    .isLength({ min: 6, max: 50 })
    .withMessage("Mật khẩu phải có từ 6-50 ký tự"),

  body("phoneNumber")
    .optional({ nullable: true })
    .trim()
    .isMobilePhone("vi-VN")
    .withMessage("Số điện thoại không hợp lệ"),

  body("avatarUrl")
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage("Avatar URL không hợp lệ"),

  body("roleId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Role ID không hợp lệ"),
];

/**
 * Validation cho login
 */
export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email/Username không được để trống"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu không được để trống"),

  body("deviceId")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Device ID quá dài"),

  body("deviceName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Device name quá dài"),
];

/**
 * Validation cho refresh token
 */
export const refreshTokenValidation = [
  body("refreshToken")
    .trim()
    .notEmpty()
    .withMessage("Refresh token không được để trống"),
];

/**
 * Validation cho update profile
 */
export const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên phải có từ 2-100 ký tự"),

  body("phoneNumber")
    .optional({ nullable: true })
    .trim()
    .isMobilePhone("vi-VN")
    .withMessage("Số điện thoại không hợp lệ"),

  body("username")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username phải có từ 3-50 ký tự")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username chỉ chứa chữ cái, số và dấu gạch dưới"),

  body("avatarUrl")
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage("Avatar URL không hợp lệ"),
];

/**
 * Validation cho change password
 */
export const changePasswordValidation = [
  body("currentPassword")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu hiện tại không được để trống"),

  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu mới không được để trống")
    .isLength({ min: 6, max: 50 })
    .withMessage("Mật khẩu mới phải có từ 6-50 ký tự")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("Mật khẩu mới phải khác mật khẩu hiện tại");
      }
      return true;
    }),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Xác nhận mật khẩu không được để trống")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Xác nhận mật khẩu không khớp");
      }
      return true;
    }),
];
