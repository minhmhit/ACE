import * as ProductModel from "../models/ProductModel.js";

/**
 * Service lấy danh sách sản phẩm
 */
export async function getProducts() {
  return ProductModel.getProducts();
}

/**
 * Service lấy chi tiết sản phẩm
 */
export async function getProductById(id) {
  const product = await ProductModel.getProductById(id);
  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }
  return product;
}

/**
 * Service tìm kiếm sản phẩm
 */
export async function searchProducts(keyword, page, limit) {
  if (!keyword || keyword.trim().length < 2) {
    throw new Error("Từ khóa tìm kiếm phải có ít nhất 2 ký tự");
  }
  return ProductModel.searchProducts(keyword.trim(), page, limit);
}

/**
 * Service thêm sản phẩm mới
 */
export async function createProduct(productData) {
  const productId = await ProductModel.createProduct(productData);
  return ProductModel.getProductById(productId);
}

/**
 * Service cập nhật sản phẩm
 */
export async function updateProduct(id, data) {
  const product = await ProductModel.getProductById(id);
  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  await ProductModel.updateProduct(id, data);
  return ProductModel.getProductById(id);
}

/**
 * Service xóa sản phẩm
 */
export async function deleteProduct(id) {
  const product = await ProductModel.getProductById(id);
  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  return ProductModel.deleteProduct(id);
}

/**
 * Service lấy danh sách biến thể
 */
export async function getProductVariants(productId) {
  const product = await ProductModel.getProductById(productId);
  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  return ProductModel.getProductVariants(productId);
}

/**
 * Service thêm biến thể mới
 */
export async function createVariant(productId, variantData) {
  const product = await ProductModel.getProductById(productId);
  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  const data = {
    ...variantData,
    productId,
  };

  const variantId = await ProductModel.createVariant(data);
  const variants = await ProductModel.getProductVariants(productId);
  return variants.find((v) => v.id === variantId);
}

/**
 * Service cập nhật biến thể
 */
export async function updateVariant(id, data) {
  const variants = await ProductModel.getProductVariants(data.productId);
  const variant = variants.find((v) => v.id === parseInt(id));

  if (!variant) {
    throw new Error("Không tìm thấy biến thể");
  }

  await ProductModel.updateVariant(id, data);
  const updatedVariants = await ProductModel.getProductVariants(data.productId);
  return updatedVariants.find((v) => v.id === parseInt(id));
}

/**
 * Service xóa biến thể
 */
export async function deleteVariant(id, productId) {
  const variants = await ProductModel.getProductVariants(productId);
  const variant = variants.find((v) => v.id === parseInt(id));

  if (!variant) {
    throw new Error("Không tìm thấy biến thể");
  }

  return ProductModel.deleteVariant(id);
}
