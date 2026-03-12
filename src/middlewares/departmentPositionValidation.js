import { body } from "express-validator";

// ============================================
// DEPARTMENT VALIDATION
// ============================================

export const createDepartmentValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Mã phòng ban không được để trống")
    .isLength({ max: 50 })
    .withMessage("Mã phòng ban tối đa 50 ký tự")
    .matches(/^[A-Z0-9_]+$/)
    .withMessage("Mã phòng ban chỉ chứa chữ in hoa, số và dấu gạch dưới"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên phòng ban không được để trống")
    .isLength({ max: 150 })
    .withMessage("Tên phòng ban tối đa 150 ký tự"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Mô tả tối đa 255 ký tự"),

  body("managerEmployeeId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("ID quản lý phải là số nguyên dương"),
];

export const updateDepartmentValidation = [
  body("code")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Mã phòng ban tối đa 50 ký tự")
    .matches(/^[A-Z0-9_]+$/)
    .withMessage("Mã phòng ban chỉ chứa chữ in hoa, số và dấu gạch dưới"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tên phòng ban không được để trống")
    .isLength({ max: 150 })
    .withMessage("Tên phòng ban tối đa 150 ký tự"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Mô tả tối đa 255 ký tự"),

  body("managerEmployeeId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("ID quản lý phải là số nguyên dương"),
];

export const toggleActiveValidation = [
  body("isActive")
    .notEmpty()
    .withMessage("isActive không được để trống")
    .isBoolean()
    .withMessage("isActive phải là boolean"),
];

// ============================================
// POSITION VALIDATION
// ============================================

export const createPositionValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Mã chức vụ không được để trống")
    .isLength({ max: 50 })
    .withMessage("Mã chức vụ tối đa 50 ký tự")
    .matches(/^[A-Z0-9_]+$/)
    .withMessage("Mã chức vụ chỉ chứa chữ in hoa, số và dấu gạch dưới"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên chức vụ không được để trống")
    .isLength({ max: 150 })
    .withMessage("Tên chức vụ tối đa 150 ký tự"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Mô tả tối đa 255 ký tự"),

  body("levelNo")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Cấp bậc phải là số nguyên dương"),
];

export const updatePositionValidation = [
  body("code")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Mã chức vụ tối đa 50 ký tự")
    .matches(/^[A-Z0-9_]+$/)
    .withMessage("Mã chức vụ chỉ chứa chữ in hoa, số và dấu gạch dưới"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tên chức vụ không được để trống")
    .isLength({ max: 150 })
    .withMessage("Tên chức vụ tối đa 150 ký tự"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Mô tả tối đa 255 ký tự"),

  body("levelNo")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Cấp bậc phải là số nguyên dương"),
];
