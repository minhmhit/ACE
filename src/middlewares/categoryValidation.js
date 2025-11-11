import { body } from "express-validator";

export const createCategoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên danh mục không được để trống")
    .isLength({ min: 2 })
    .withMessage("Tên danh mục phải có ít nhất 2 ký tự"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Mô tả phải có ít nhất 10 ký tự"),

  body("parentId")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true;
      }
      if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
        throw new Error("ID danh mục cha không hợp lệ");
      }
      return true;
    }),
];

export const updateCategoryValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Tên danh mục phải có ít nhất 2 ký tự"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Mô tả phải có ít nhất 10 ký tự"),

  body("parentId")
    .optional()
    .isInt()
    .withMessage("ID danh mục cha không hợp lệ"),
];
