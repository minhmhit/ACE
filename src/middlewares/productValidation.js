import { body } from "express-validator";

export const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên sản phẩm không được để trống")
    .isLength({ min: 2 })
    .withMessage("Tên sản phẩm phải có ít nhất 2 ký tự"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Mô tả không được để trống")
    .isLength({ min: 10 })
    .withMessage("Mô tả phải có ít nhất 10 ký tự"),

  body("price")
    .notEmpty()
    .withMessage("Giá không được để trống")
    .isFloat({ min: 0 })
    .withMessage("Giá phải là số dương"),

  body("categoryId")
    .notEmpty()
    .withMessage("Danh mục không được để trống")
    .isInt()
    .withMessage("ID danh mục không hợp lệ"),

  body("supplierId")
    .notEmpty()
    .withMessage("Nhà cung cấp không được để trống")
    .isInt()
    .withMessage("ID nhà cung cấp không hợp lệ"),

  body("imageUrl")
    .optional()
    .custom((value) => {
      // Cho phép: URL tuyệt đối hoặc đường dẫn tương đối ./asset/img/
      const isHttpUrl = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value);
      const isLocalPath = /^(\.\/|\/)?(asset|uploads|images)\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value);

      if (!isHttpUrl && !isLocalPath) {
        throw new Error('Đường dẫn hình ảnh không hợp lệ');
      }
      return true;
    })
    .withMessage("URL hình ảnh không hợp lệ"),
];

export const updateProductValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Tên sản phẩm phải có ít nhất 2 ký tự"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Mô tả phải có ít nhất 10 ký tự"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Giá phải là số dương"),

  body("categoryId").optional().isInt().withMessage("ID danh mục không hợp lệ"),

  body("supplierId")
    .optional()
    .isInt()
    .withMessage("ID nhà cung cấp không hợp lệ"),

  body("imageUrl")
    .optional()
    .optional()
    .custom((value) => {
      // Cho phép: URL tuyệt đối hoặc đường dẫn tương đối ./asset/img/
      const isHttpUrl = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value);
      const isLocalPath =
        /^(\.\/|\/)?(asset|uploads|images)\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(
          value
        );

      if (!isHttpUrl && !isLocalPath) {
        throw new Error("Đường dẫn hình ảnh không hợp lệ");
      }
      return true;
    })
    .withMessage("URL hình ảnh không hợp lệ"),
];

export const createVariantValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên biến thể không được để trống")
    .isLength({ min: 2 })
    .withMessage("Tên biến thể phải có ít nhất 2 ký tự"),

  body("additionalPrice")
    .notEmpty()
    .withMessage("Giá thêm không được để trống")
    .isFloat({ min: 0 })
    .withMessage("Giá thêm phải là số dương"),
];

export const updateVariantValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Tên biến thể phải có ít nhất 2 ký tự"),

  body("additionalPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Giá thêm phải là số dương"),
];
