import { body } from "express-validator";

// ============================================
// EMPLOYEE VALIDATION
// ============================================

/**
 * Validation khi nhân viên tự cập nhật thông tin cá nhân
 */
export const updateMeValidation = [
  body("address")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Địa chỉ tối đa 255 ký tự"),

  body("emergencyContactName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Tên người liên hệ khẩn cấp tối đa 150 ký tự"),

  body("emergencyContactPhone")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage("SĐT liên hệ khẩn cấp tối đa 20 ký tự"),

  body("bankAccountNo")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Số tài khoản tối đa 50 ký tự"),

  body("bankAccountName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Tên tài khoản tối đa 150 ký tự"),

  body("bankName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Tên ngân hàng tối đa 150 ký tự"),
];

/**
 * Validation tạo nhân viên mới (Admin/HRM)
 */
export const createEmployeeValidation = [
  // --- Thông tin user ---
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên không được để trống")
    .isLength({ max: 255 })
    .withMessage("Tên tối đa 255 ký tự"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username từ 3-50 ký tự")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username chỉ chứa chữ, số và dấu gạch dưới"),

  body("password")
    .notEmpty()
    .withMessage("Mật khẩu không được để trống")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu tối thiểu 6 ký tự"),

  body("roleId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("roleId phải là số nguyên dương"),

  body("phoneNumber")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage("SĐT tối đa 20 ký tự"),

  // --- Thông tin employee ---
  body("employeeCode")
    .trim()
    .notEmpty()
    .withMessage("Mã nhân viên không được để trống")
    .isLength({ max: 50 })
    .withMessage("Mã nhân viên tối đa 50 ký tự")
    .matches(/^[A-Z0-9_]+$/)
    .withMessage("Mã nhân viên chỉ chứa chữ in hoa, số và dấu gạch dưới"),

  body("departmentId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("departmentId phải là số nguyên dương"),

  body("directManagerEmployeeId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("directManagerEmployeeId phải là số nguyên dương"),

  body("employmentType")
    .optional()
    .isIn(["FULL_TIME", "PART_TIME", "INTERN", "CONTRACT"])
    .withMessage(
      "employmentType phải là: FULL_TIME, PART_TIME, INTERN, CONTRACT",
    ),

  body("status")
    .optional()
    .isIn(["PROBATION", "ACTIVE"])
    .withMessage("Trạng thái ban đầu chỉ được: PROBATION, ACTIVE"),

  body("hireDate")
    .notEmpty()
    .withMessage("Ngày vào làm không được để trống")
    .isISO8601()
    .withMessage("Ngày vào làm phải đúng định dạng (YYYY-MM-DD)"),

  body("officialDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Ngày chính thức phải đúng định dạng (YYYY-MM-DD)"),

  body("dateOfBirth")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Ngày sinh phải đúng định dạng (YYYY-MM-DD)"),

  body("gender")
    .optional({ nullable: true })
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Giới tính phải là: MALE, FEMALE, OTHER"),

  body("nationalId")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("CMND/CCCD tối đa 50 ký tự"),

  body("address")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Địa chỉ tối đa 255 ký tự"),

  body("emergencyContactName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Tên người liên hệ khẩn cấp tối đa 150 ký tự"),

  body("emergencyContactPhone")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage("SĐT liên hệ khẩn cấp tối đa 20 ký tự"),

  body("bankAccountNo")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Số tài khoản tối đa 50 ký tự"),

  body("bankAccountName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Tên tài khoản tối đa 150 ký tự"),

  body("bankName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Tên ngân hàng tối đa 150 ký tự"),

  // --- Thông tin position ban đầu ---
  body("positionId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("positionId phải là số nguyên dương"),

  body("baseSalary")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Lương cơ bản phải là số thập phân hợp lệ"),

  body("allowanceAmount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Phụ cấp phải là số thập phân hợp lệ"),

  body("salaryType")
    .optional()
    .isIn(["MONTHLY", "DAILY", "HOURLY"])
    .withMessage("salaryType phải là: MONTHLY, DAILY, HOURLY"),
];

/**
 * Validation cập nhật nhân viên (Admin/HRM)
 */
export const updateEmployeeValidation = [
  body("departmentId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("departmentId phải là số nguyên dương"),

  body("directManagerEmployeeId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("directManagerEmployeeId phải là số nguyên dương"),

  body("employmentType")
    .optional()
    .isIn(["FULL_TIME", "PART_TIME", "INTERN", "CONTRACT"])
    .withMessage(
      "employmentType phải là: FULL_TIME, PART_TIME, INTERN, CONTRACT",
    ),

  body("hireDate")
    .optional()
    .isISO8601()
    .withMessage("Ngày vào làm phải đúng định dạng (YYYY-MM-DD)"),

  body("officialDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Ngày chính thức phải đúng định dạng (YYYY-MM-DD)"),

  body("dateOfBirth")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Ngày sinh phải đúng định dạng (YYYY-MM-DD)"),

  body("gender")
    .optional({ nullable: true })
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Giới tính phải là: MALE, FEMALE, OTHER"),

  body("nationalId")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("CMND/CCCD tối đa 50 ký tự"),

  body("address")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Địa chỉ tối đa 255 ký tự"),

  body("emergencyContactName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Tên người liên hệ khẩn cấp tối đa 150 ký tự"),

  body("emergencyContactPhone")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage("SĐT liên hệ khẩn cấp tối đa 20 ký tự"),

  body("bankAccountNo")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Số tài khoản tối đa 50 ký tự"),

  body("bankAccountName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Tên tài khoản tối đa 150 ký tự"),

  body("bankName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Tên ngân hàng tối đa 150 ký tự"),
];

/**
 * Validation chuyển trạng thái
 */
export const changeStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Trạng thái không được để trống")
    .isIn(["PROBATION", "ACTIVE", "ON_LEAVE", "RESIGNED", "TERMINATED"])
    .withMessage(
      "Trạng thái phải là: PROBATION, ACTIVE, ON_LEAVE, RESIGNED, TERMINATED",
    ),
];

/**
 * Validation đổi chức vụ / lương
 */
export const changePositionValidation = [
  body("positionId")
    .notEmpty()
    .withMessage("positionId không được để trống")
    .isInt({ min: 1 })
    .withMessage("positionId phải là số nguyên dương"),

  body("departmentId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("departmentId phải là số nguyên dương"),

  body("effectiveFrom")
    .notEmpty()
    .withMessage("Ngày hiệu lực không được để trống")
    .isISO8601()
    .withMessage("Ngày hiệu lực phải đúng định dạng (YYYY-MM-DD)"),

  body("baseSalary")
    .notEmpty()
    .withMessage("Lương cơ bản không được để trống")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Lương cơ bản phải là số thập phân hợp lệ"),

  body("allowanceAmount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Phụ cấp phải là số thập phân hợp lệ"),

  body("salaryType")
    .optional()
    .isIn(["MONTHLY", "DAILY", "HOURLY"])
    .withMessage("salaryType phải là: MONTHLY, DAILY, HOURLY"),

  body("note")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Ghi chú tối đa 255 ký tự"),

  body("changedReason")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Lý do tối đa 255 ký tự"),
];
