import { pool } from "../config/db.js";

/**
 * Lấy danh sách danh mục (dạng cây)
 */
export async function getCategories() {
  // Lấy tất cả danh mục
  const [rows] = await pool.query(
    `SELECT c.*, 
            (SELECT COUNT(*) FROM products p WHERE p.categoryId = c.id) as productCount,
            parent.name as parentName
     FROM categories c
     LEFT JOIN categories parent ON c.parentId = parent.id
     ORDER BY c.parentId ASC, c.name ASC`
  );

  return rows;
}

/**
 * Lấy chi tiết danh mục và sản phẩm trong danh mục
 */
export async function getCategoryById(id) {
  // Lấy thông tin danh mục
  const [categories] = await pool.query(
    `SELECT c.*, parent.name as parentName
     FROM categories c
     LEFT JOIN categories parent ON c.parentId = parent.id
     WHERE c.id = ?`,
    [id]
  );

  if (categories.length === 0) {
    return null;
  }

  const category = categories[0];

  // Lấy danh sách sản phẩm trong danh mục
  const [products] = await pool.query(
    `SELECT p.*, s.name as supplierName, i.quantity as stockQuantity
     FROM products p
     LEFT JOIN suppliers s ON p.supplierId = s.id
     LEFT JOIN inventories i ON p.id = i.productId
     WHERE p.categoryId = ?`,
    [id]
  );

  // Lấy danh sách danh mục con
  const [subCategories] = await pool.query(
    "SELECT * FROM categories WHERE parentId = ?",
    [id]
  );

  return {
    ...category,
    products,
    subCategories,
  };
}

/**
 * Tạo danh mục mới
 */
export async function createCategory(data) {
  const [result] = await pool.query("INSERT INTO categories SET ?", [data]);
  return result.insertId;
}

/**
 * Cập nhật danh mục
 */
export async function updateCategory(id, data) {
  // Kiểm tra không cho phép đặt parentId là chính nó
  if (data.parentId && data.parentId === parseInt(id)) {
    throw new Error("Danh mục không thể là danh mục cha của chính nó");
  }

  const [result] = await pool.query("UPDATE categories SET ? WHERE id = ?", [
    data,
    id,
  ]);
  return result.affectedRows > 0;
}

/**
 * Xóa danh mục
 */
export async function deleteCategory(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Kiểm tra xem có sản phẩm nào trong danh mục không
    const [products] = await connection.query(
      "SELECT COUNT(*) as count FROM products WHERE categoryId = ?",
      [id]
    );

    if (products[0].count > 0) {
      throw new Error("Không thể xóa danh mục đang có sản phẩm");
    }

    // Kiểm tra xem có danh mục con không
    const [subCategories] = await connection.query(
      "SELECT COUNT(*) as count FROM categories WHERE parentId = ?",
      [id]
    );

    if (subCategories[0].count > 0) {
      throw new Error("Không thể xóa danh mục đang có danh mục con");
    }

    // Thực hiện xóa danh mục
    const [result] = await connection.query(
      "UPDATE categories SET isActive = 0 WHERE id = ?",
      [id]
    );

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Kiểm tra danh mục có tồn tại
 */
export async function categoryExists(id) {
  const [rows] = await pool.query("SELECT id FROM categories WHERE id = ?", [
    id,
  ]);
  return rows.length > 0;
}
