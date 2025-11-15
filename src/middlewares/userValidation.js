import { body } from "express-validator";

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên không được để trống")
    .isLength({ min: 2 })
    .withMessage("Tên phải có ít nhất 2 ký tự"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không hợp lệ"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu không được để trống")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),

  body("phoneNumber")
  .optional({ nullable: true })
  .isMobilePhone(),

  body("roleId").optional({ nullable: true }),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không hợp lệ"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu không được để trống"),
];

export const updateProfileValidation = [
  body("name")
    .trim()
    .optional()
    .isLength({ min: 2 })
    .withMessage("Tên phải có ít nhất 2 ký tự"),
  body("phoneNumber")
    .trim()
    .optional()
    .isMobilePhone()
    .withMessage("Số điện thoại không được để trống"),
];

export const changePasswordValidation = [
  body("currentPassword")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu hiện tại không được để trống"),

  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu mới không được để trống")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu mới phải có ít nhất 6 ký tự"),
];

export const updateUserStatusValidation = [
  body("isActive").isBoolean().withMessage("Trạng thái không hợp lệ"),
];
