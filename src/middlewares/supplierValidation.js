import { body } from "express-validator";

const supplierValidation = [
  body("name")
    .notEmpty()
    .withMessage("Tên nhà cung cấp không được để trống")
    .isString()
    .withMessage("Tên nhà cung cấp phải là chuỗi")
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên nhà cung cấp phải từ 2-100 ký tự"),

  body("code")
    .notEmpty()
    .withMessage("Mã nhà cung cấp không được để trống")
    .isString()
    .withMessage("Mã nhà cung cấp phải là chuỗi")
    .matches(/^[A-Z0-9-]+$/)
    .withMessage(
      "Mã nhà cung cấp chỉ chấp nhận chữ in hoa, số và dấu gạch ngang"
    )
    .isLength({ min: 3, max: 20 })
    .withMessage("Mã nhà cung cấp phải từ 3-20 ký tự"),

  body("address")
    .optional()
    .isString()
    .withMessage("Địa chỉ phải là chuỗi")
    .isLength({ max: 200 })
    .withMessage("Địa chỉ không được vượt quá 200 ký tự"),

  body("contactInfo")
    .optional()
    .isString()
    .withMessage("Thông tin liên hệ phải là chuỗi")
    .isLength({ max: 100 })
    .withMessage("Thông tin liên hệ không được vượt quá 100 ký tự"),
];

const updateSupplierValidation = [
  body("name")
    .optional()
    .isString()
    .withMessage("Tên nhà cung cấp phải là chuỗi")
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên nhà cung cấp phải từ 2-100 ký tự"),
  body("code")
    .optional()
    .isString() 
    .withMessage("Mã nhà cung cấp phải là chuỗi")
    .matches(/^[A-Z0-9-]+$/)
    .withMessage(
      "Mã nhà cung cấp chỉ chấp nhận chữ in hoa, số và dấu gạch ngang"
    )
    .isLength({ min: 3, max: 20 })
    .withMessage("Mã nhà cung cấp phải từ 3-20 ký tự"),
  body("address")
    .optional()
    .isString()
    .withMessage("Địa chỉ phải là chuỗi")
    .isLength({ max: 200 })
    .withMessage("Địa chỉ không được vượt quá 200 ký tự"),
  body("contactInfo")
    .optional()
    .isString()
    .withMessage("Thông tin liên hệ phải là chuỗi")
    .isLength({ max: 100 })
    .withMessage("Thông tin liên hệ không được vượt quá 100 ký tự"),
];

export { supplierValidation, updateSupplierValidation };