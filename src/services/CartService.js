import * as CartModel from "../models/CartModel.js";
import * as ProductModel from "../models/ProductModel.js";

/**
 * Service xem giỏ hàng
 */
export async function getCart(userId) {
  const cart = await CartModel.getOrCreateCart(userId);
  const items = await CartModel.getCartDetails(cart.id);
  const total = await CartModel.calculateCartTotal(cart.id);

  return {
    id: cart.id,
    items,
    total,
    itemCount: items.length,
  };
}

/**
 * Service thêm sản phẩm vào giỏ
 */
export async function addToCart(userId, { productId, variantId, quantity }) {
  // Kiểm tra sản phẩm tồn tại
  const product = await ProductModel.getProductById(productId);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại");
  }

  // Kiểm tra variant nếu có
  if (variantId) {
    const variants = await ProductModel.getProductVariants(productId);
    const variant = variants.find((v) => v.id === parseInt(variantId));
    if (!variant) {
      throw new Error("Biến thể không tồn tại");
    }
  }

  // Kiểm tra số lượng
  if (quantity < 1) {
    throw new Error("Số lượng phải lớn hơn 0");
  }

  // Lấy hoặc tạo giỏ hàng
  const cart = await CartModel.getOrCreateCart(userId);

  // Thêm vào giỏ với giá hiện tại của sản phẩm
  await CartModel.addToCart(cart.id, {
    productId,
    variantId,
    quantity,
    unitPrice: product.price,
  });

  return getCart(userId);
}

/**
 * Service cập nhật số lượng sản phẩm
 */
export async function updateCartItem(userId, itemId, quantity) {
  // Kiểm tra item thuộc về user
  const isOwner = await CartModel.verifyCartItemOwner(itemId, userId);
  if (!isOwner) {
    throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
  }

  // Kiểm tra số lượng
  if (quantity < 1) {
    throw new Error("Số lượng phải lớn hơn 0");
  }

  await CartModel.updateCartItem(itemId, quantity);
  return getCart(userId);
}

/**
 * Service xóa sản phẩm khỏi giỏ
 */
export async function removeFromCart(userId, itemId) {
  // Kiểm tra item thuộc về user
  const isOwner = await CartModel.verifyCartItemOwner(itemId, userId);
  if (!isOwner) {
    throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
  }

  await CartModel.removeFromCart(itemId);
  return getCart(userId);
}

/**
 * Service xóa toàn bộ giỏ hàng
 */
export async function clearCart(userId) {
  const cart = await CartModel.getOrCreateCart(userId);
  await CartModel.clearCart(cart.id);
  return getCart(userId);
}
