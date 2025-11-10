import { validationResult } from "express-validator";
import * as CategoryService from "../services/CategoryService.js";

/**
 * Controller lấy danh sách danh mục
 */
export async function getCategories(req, res, next) {
  try {
    const categories = await CategoryService.getCategories();
    res.json({
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller lấy chi tiết danh mục
 */
export async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    const category = await CategoryService.getCategoryById(id);
    res.json({
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller tạo danh mục mới
 */
export async function createCategory(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const category = await CategoryService.createCategory(req.body);
    res.status(201).json({
      message: "Tạo danh mục thành công",
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller cập nhật danh mục
 */
export async function updateCategory(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const category = await CategoryService.updateCategory(id, req.body);
    res.json({
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller xóa danh mục
 */
export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    await CategoryService.deleteCategory(id);
    res.json({
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    next(error);
  }
}
