import { pool } from "../config/db.js";

/**
 * Lấy danh sách sản phẩm có phân trang
 */
export async function getProducts(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT p.*, c.name as categoryName, s.name as supplierName, 
    i.quantity as stockQuantity
    FROM products p 
    LEFT JOIN categories c ON p.categoryId = c.id
    LEFT JOIN suppliers s ON p.supplierId = s.id
    LEFT JOIN inventories i ON p.id = i.productId
    LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
}

/**
 * Lấy chi tiết sản phẩm theo id
 */
export async function getProductById(id) {
  const [rows] = await pool.query(
    `SELECT p.*, c.name as categoryName, s.name as supplierName,
    i.quantity as stockQuantity
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    LEFT JOIN suppliers s ON p.supplierId = s.id
    LEFT JOIN inventories i ON p.id = i.productId
    WHERE p.id = ?`,
    [id]
  );
  return rows[0];
}

/**
 * Thêm sản phẩm mới
 */
export async function createProduct(data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Thêm sản phẩm
    const [result] = await connection.query("INSERT INTO products SET ?", [
      data,
    ]);
    const productId = result.insertId;

    // Khởi tạo inventory với số lượng 0
    await connection.query(
      "INSERT INTO inventories (productId, quantity) VALUES (?, 0)",
      [productId]
    );

    await connection.commit();
    return productId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Cập nhật thông tin sản phẩm
 */
export async function updateProduct(id, data) {
  const [result] = await pool.query("UPDATE products SET ? WHERE id = ?", [
    data,
    id,
  ]);
  return result.affectedRows > 0;
}
