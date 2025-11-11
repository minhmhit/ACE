import { pool } from "../config/db.js";

/**
 * Lấy hoặc tạo giỏ hàng cho user
 */
export async function getOrCreateCart(userId) {
  // Kiểm tra giỏ hàng tồn tại
  const [carts] = await pool.query("SELECT * FROM carts WHERE userId = ?", [
    userId,
  ]);

  if (carts.length > 0) {
    return carts[0];
  }

  // Nếu chưa có thì tạo mới
  const [result] = await pool.query("INSERT INTO carts (userId) VALUES (?)", [
    userId,
  ]);

  const [newCart] = await pool.query("SELECT * FROM carts WHERE id = ?", [
    result.insertId,
  ]);

  return newCart[0];
}

/**
 * Lấy chi tiết giỏ hàng với các sản phẩm
 */
export async function getCartDetails(cartId) {
  const [items] = await pool.query(
    `SELECT ci.*, p.name as productName, p.description, p.imageUrl,
            v.name as variantName, v.additionalPrice as variantPrice
     FROM cart_items ci
     LEFT JOIN products p ON ci.productId = p.id
     LEFT JOIN variants v ON ci.variantId = v.id
     WHERE ci.cartId = ?`,
    [cartId]
  );

  return items;
}

/**
 * Thêm sản phẩm vào giỏ hàng
 */
export async function addToCart(
  cartId,
  { productId, variantId, quantity, unitPrice }
) {
  // Kiểm tra sản phẩm đã có trong giỏ chưa
  // Xử lý trường hợp variantId có thể null
  let query, params;
  
  if (variantId) {
    query = "SELECT * FROM cart_items WHERE cartId = ? AND productId = ? AND variantId = ?";
    params = [cartId, productId, variantId];
  } else {
    query = "SELECT * FROM cart_items WHERE cartId = ? AND productId = ? AND variantId IS NULL";
    params = [cartId, productId];
  }

  const [existingItems] = await pool.query(query, params);

  if (existingItems.length > 0) {
    // Nếu có rồi thì cập nhật số lượng
    const newQuantity = Number(existingItems[0].quantity) + Number(quantity);
    console.log(newQuantity);
    await pool.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
      newQuantity,
      existingItems[0].id,
    ]);
    return existingItems[0].id;
  }

  // Nếu chưa có thì thêm mới
  const [result] = await pool.query(
    "INSERT INTO cart_items (cartId, productId, variantId, quantity, unitPrice) VALUES (?, ?, ?, ?, ?)",
    [cartId, productId, variantId || null, quantity, unitPrice]
  );

  return result.insertId;
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ
 */
export async function updateCartItem(itemId, quantity) {
  const [result] = await pool.query(
    "UPDATE cart_items SET quantity = ? WHERE id = ?",
    [quantity, itemId]
  );
  return result.affectedRows > 0;
}

/**
 * Xóa sản phẩm khỏi giỏ
 */
export async function removeFromCart(itemId) {
  const [result] = await pool.query("DELETE FROM cart_items WHERE id = ?", [
    itemId,
  ]);
  return result.affectedRows > 0;
}

/**
 * Xóa toàn bộ sản phẩm trong giỏ
 */
export async function clearCart(cartId) {
  const [result] = await pool.query("DELETE FROM cart_items WHERE cartId = ?", [
    cartId,
  ]);
  return result.affectedRows > 0;
}

/**
 * Kiểm tra cart item có tồn tại và thuộc về user không
 */
export async function verifyCartItemOwner(itemId, userId) {
  const [rows] = await pool.query(
    `SELECT ci.id
     FROM cart_items ci
     JOIN carts c ON ci.cartId = c.id
     WHERE ci.id = ? AND c.userId = ?`,
    [itemId, userId]
  );
  return rows.length > 0;
}

/**
 * Tính tổng tiền giỏ hàng
 */
export async function calculateCartTotal(cartId) {
  const [result] = await pool.query(
    `SELECT SUM(ci.quantity * (ci.unitPrice + COALESCE(v.additionalPrice, 0))) as total
     FROM cart_items ci
     LEFT JOIN variants v ON ci.variantId = v.id
     WHERE ci.cartId = ?`,
    [cartId]
  );
  return result[0].total || 0;
}

/**
 * Lấy giỏ hàng của user 
 */
export async function getCart(userId) {
  // Lấy hoặc tạo giỏ hàng
  const cart = await getOrCreateCart(userId);

  // Lấy danh sách items trong giỏ với thông tin đầy đủ
  const [items] = await pool.query(
    `SELECT 
      ci.id,
      ci.cartId,
      ci.productId,
      ci.variantId,
      ci.quantity,
      ci.unitPrice,
      p.name as productName,
      p.description as productDescription,
      p.imageUrl as productImage,
      v.name as variantName,
      v.additionalPrice as variantPrice,
      (ci.unitPrice + COALESCE(v.additionalPrice, 0)) as finalPrice,
      (ci.quantity * (ci.unitPrice + COALESCE(v.additionalPrice, 0))) as totalPrice,
      i.quantity as stockQuantity
    FROM cart_items ci
    LEFT JOIN products p ON ci.productId = p.id
    LEFT JOIN variants v ON ci.variantId = v.id
    LEFT JOIN inventories i ON p.id = i.productId
    WHERE ci.cartId = ?
    ORDER BY ci.id DESC`,
    [cart.id]
  );

  // Tính tổng tiền giỏ hàng
  let totalAmount = 0;
  for (const item of items) {
    totalAmount += item.totalPrice;
  }

  return {
    id: cart.id,
    userId: cart.userId,
    items: items,
    totalAmount: totalAmount,
    itemCount: items.length
  };
}