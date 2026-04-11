import { body } from "express-validator";

// ============================================
// SELF-SERVICE VALIDATION
// ============================================

/**
 * Validation cho PATCH /users/me
 * User chỉ sửa được: name, phoneNumber, username, avatarUrl
 */
export const updateMeValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên phải từ 2-100 ký tự"),

  body("phoneNumber")
    .optional({ nullable: true })
    .trim()
    .isMobilePhone("vi-VN")
    .withMessage("Số điện thoại không hợp lệ"),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username phải từ 3-50 ký tự")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username chỉ chứa chữ cái, số và dấu gạch dưới"),

  body("avatarUrl")
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage("Avatar URL không hợp lệ"),

  body("address")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Địa chỉ phải có từ 5-500 ký tự"),

  body("fullAddress")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Địa chỉ phải có từ 5-500 ký tự"),

  body("receiverName")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên người nhận phải có từ 2-100 ký tự"),

  body("addressType")
    .optional({ nullable: true })
    .isIn(["home", "office"])
    .withMessage("addressType chỉ nhận home hoặc office"),

  // Chặn các field không được phép
  body("email").not().exists().withMessage("Không được phép thay đổi email"),
  body("roleId").not().exists().withMessage("Không được phép thay đổi role"),
  body("password").not().exists().withMessage("Dùng API đổi mật khẩu riêng"),
  body("isActive")
    .not()
    .exists()
    .withMessage("Không được phép thay đổi trạng thái"),
];

// ============================================
// ADMIN VALIDATION
// ============================================

/**
 * Validation cho POST /admin/users (admin tạo user)
 */
export const adminCreateUserValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên không được để trống")
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên phải từ 2-100 ký tự"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu không được để trống")
    .isLength({ min: 6, max: 50 })
    .withMessage("Mật khẩu phải từ 6-50 ký tự"),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username phải từ 3-50 ký tự")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username chỉ chứa chữ cái, số và dấu gạch dưới"),

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
    .optional()
    .isInt({ min: 1 })
    .withMessage("Role ID phải là số nguyên dương"),
];

/**
 * Validation cho PATCH /admin/users/:id (admin cập nhật user)
 */
export const adminUpdateUserValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên phải từ 2-100 ký tự"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),

  body("password")
    .optional()
    .trim()
    .isLength({ min: 6, max: 50 })
    .withMessage("Mật khẩu phải từ 6-50 ký tự"),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username phải từ 3-50 ký tự")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username chỉ chứa chữ cái, số và dấu gạch dưới"),

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
    .optional()
    .isInt({ min: 1 })
    .withMessage("Role ID phải là số nguyên dương"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là boolean"),
];

/**
 * Validation cho PATCH /admin/users/:id/active
 */
export const toggleActiveValidation = [
  body("isActive")
    .notEmpty()
    .withMessage("isActive không được để trống")
    .isBoolean()
    .withMessage("isActive phải là boolean"),
];
