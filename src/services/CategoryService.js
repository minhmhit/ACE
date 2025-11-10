import * as CategoryModel from "../models/CategoryModel.js";

/**
 * Service lấy danh sách danh mục
 */
export async function getCategories() {
  return CategoryModel.getCategories();
}

/**
 * Service lấy chi tiết danh mục
 */
export async function getCategoryById(id) {
  const category = await CategoryModel.getCategoryById(id);
  if (!category) {
    throw new Error("Không tìm thấy danh mục");
  }
  return category;
}

/**
 * Service tạo danh mục mới
 */
export async function createCategory(data) {
  // Kiểm tra parentId nếu có
  if (data.parentId) {
    const parentExists = await CategoryModel.categoryExists(data.parentId);
    if (!parentExists) {
      throw new Error("Danh mục cha không tồn tại");
    }
  }

  // Kiểm tra tên danh mục là duy nhất
  const categories = await CategoryModel.getCategories();
  const existingCategory = categories.find(
    (c) => c.name.toLowerCase() === data.name.toLowerCase()
  );
  if (existingCategory) {
    throw new Error("Tên danh mục đã tồn tại");
  }

  const categoryId = await CategoryModel.createCategory(data);
  return CategoryModel.getCategoryById(categoryId);
}

/**
 * Service cập nhật danh mục
 */
export async function updateCategory(id, data) {
  // Kiểm tra danh mục tồn tại
  const category = await CategoryModel.getCategoryById(id);
  if (!category) {
    throw new Error("Không tìm thấy danh mục");
  }

  // Kiểm tra parentId nếu có
  if (data.parentId) {
    // Không cho phép đặt parentId là chính nó
    if (data.parentId === parseInt(id)) {
      throw new Error("Danh mục không thể là danh mục cha của chính nó");
    }

    const parentExists = await CategoryModel.categoryExists(data.parentId);
    if (!parentExists) {
      throw new Error("Danh mục cha không tồn tại");
    }
  }

  // Kiểm tra tên mới không trùng với danh mục khác
  if (data.name && data.name !== category.name) {
    const categories = await CategoryModel.getCategories();
    const existingCategory = categories.find(
      (c) =>
        c.name.toLowerCase() === data.name.toLowerCase() &&
        c.id !== parseInt(id)
    );
    if (existingCategory) {
      throw new Error("Tên danh mục đã tồn tại");
    }
  }

  await CategoryModel.updateCategory(id, data);
  return CategoryModel.getCategoryById(id);
}

/**
 * Service xóa danh mục
 */
export async function deleteCategory(id) {
  // Kiểm tra danh mục tồn tại
  const exists = await CategoryModel.categoryExists(id);
  if (!exists) {
    throw new Error("Không tìm thấy danh mục");
  }

  return CategoryModel.deleteCategory(id);
}
