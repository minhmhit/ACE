import { pool } from "../config/db.js";

/**
 * Lấy danh sách tất cả sản phẩm
 */
export async function getProducts() {
  const [rows] = await pool.query(
    `SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.imageUrl,
      p.categoryId,
      p.supplierId,
      c.name as categoryName,
      s.name as supplierName,
      s.code as supplierCode,
      i.quantity as stockQuantity
    FROM products p 
    LEFT JOIN categories c ON p.categoryId = c.id
    LEFT JOIN suppliers s ON p.supplierId = s.id
    LEFT JOIN inventories i ON p.id = i.productId
    ORDER BY p.id DESC`
  );

  // Lấy variants cho từng sản phẩm
  for (let product of rows) {
    const [variants] = await pool.query(
      `SELECT 
        id,
        name,
        additionalPrice,
        (? + COALESCE(additionalPrice, 0)) as finalPrice
      FROM variants 
      WHERE productId = ?`,
      [product.price, product.id]
    );
    product.variants = variants;
  }

  return rows;
}

/**
 * Lấy danh sách sản phẩm theo category
 */
export async function getProductsByCategory(categoryId) {
  const [rows] = await pool.query(
    `SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.imageUrl,
      p.categoryId,
      p.supplierId,
      c.name as categoryName,
      s.name as supplierName,
      s.code as supplierCode,
      i.quantity as stockQuantity
    FROM products p 
    LEFT JOIN categories c ON p.categoryId = c.id
    LEFT JOIN suppliers s ON p.supplierId = s.id
    LEFT JOIN inventories i ON p.id = i.productId
    WHERE p.categoryId = ?
    ORDER BY p.id DESC`,
    [categoryId]
  );

  // Lấy variants cho từng sản phẩm
  for (let product of rows) {
    const [variants] = await pool.query(
      `SELECT 
        id,
        name,
        additionalPrice,
        (? + COALESCE(additionalPrice, 0)) as finalPrice
      FROM variants 
      WHERE productId = ?`,
      [product.price, product.id]
    );
    product.variants = variants;
  }

  return rows;
}

/**
 * Tìm kiếm sản phẩm theo từ khóa
 */
export async function searchProducts(keyword) {
  const searchTerm = `%${keyword}%`;
  const [rows] = await pool.query(
    `SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.imageUrl,
      p.categoryId,
      p.supplierId,
      c.name as categoryName,
      s.name as supplierName,
      s.code as supplierCode,
      i.quantity as stockQuantity
    FROM products p 
    LEFT JOIN categories c ON p.categoryId = c.id
    LEFT JOIN suppliers s ON p.supplierId = s.id
    LEFT JOIN inventories i ON p.id = i.productId
    WHERE p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?
    ORDER BY p.id DESC`,
    [searchTerm, searchTerm, searchTerm]
  );

  // Lấy variants cho từng sản phẩm
  for (let product of rows) {
    const [variants] = await pool.query(
      `SELECT 
        id,
        name,
        additionalPrice,
        (? + COALESCE(additionalPrice, 0)) as finalPrice
      FROM variants 
      WHERE productId = ?`,
      [product.price, product.id]
    );
    product.variants = variants;
  }

  return rows;
}

/**
 * Lấy chi tiết sản phẩm theo id
 */
export async function getProductById(id) {
  const [rows] = await pool.query(
    `SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.imageUrl,
      p.categoryId,
      p.supplierId,
      c.name as categoryName,
      s.name as supplierName,
      i.quantity as stockQuantity
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    LEFT JOIN suppliers s ON p.supplierId = s.id
    LEFT JOIN inventories i ON p.id = i.productId
    WHERE p.id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  const product = rows[0];

  // Lấy variants của sản phẩm
  const [variants] = await pool.query(
    `SELECT 
      id,
      name,
      additionalPrice,
      (? + COALESCE(additionalPrice, 0)) as finalPrice
    FROM variants 
    WHERE productId = ?`,
    [product.price, product.id]
  );

  product.variants = variants;

  return product;
}



/**
 * Lấy chi tiết sản phẩm theo id
 */
// export async function getProductById(id) {
//   const [rows] = await pool.query(
//     `SELECT p.*, c.name as categoryName, s.name as supplierName,
//     i.quantity as stockQuantity
//     FROM products p
//     LEFT JOIN categories c ON p.categoryId = c.id
//     LEFT JOIN suppliers s ON p.supplierId = s.id
//     LEFT JOIN inventories i ON p.id = i.productId
//     WHERE p.id = ?`,
//     [id]
//   );
//   return rows[0];
// }

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

/**
 * Xoá sản phẩm
 */
export async function deleteProduct(id) {
  const [result] = await pool.query("UPDATE products SET isActive = 0 WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

