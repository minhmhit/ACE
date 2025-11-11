import VariantModel from "../models/VariantModel.js";
import * as ProductModel from "../models/ProductModel.js";

class VariantService {
  // Lấy tất cả variants của một sản phẩm
  static async getProductVariants(productId) {
    const product = await ProductModel.getProductById(productId);
    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    const variants = await VariantModel.getVariantsByProductId(productId);
    return {
      productId,
      productName: product.name,
      basePrice: product.price,
      variants: variants.map((v) => ({
        ...v,
        finalPrice: parseFloat(product.price) + parseFloat(v.additionalPrice),
      })),
    };
  }

  // Lấy chi tiết một variant
  static async getVariantById(id) {
    const variant = await VariantModel.getVariantById(id);
    if (!variant) {
      throw new Error("Không tìm thấy biến thể sản phẩm");
    }

    return {
      ...variant,
      finalPrice:
        parseFloat(variant.basePrice) + parseFloat(variant.additionalPrice),
    };
  }

  // Tạo variant mới
  static async createVariant(data) {
    // Kiểm tra sản phẩm tồn tại
    const product = await ProductModel.getProductById(data.productId);
    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    // Kiểm tra giá thêm hợp lệ
    if (data.additionalPrice < 0) {
      throw new Error("Giá thêm không được âm");
    }

    const variantId = await VariantModel.createVariant(data);
    return await VariantModel.getVariantById(variantId);
  }

  // Cập nhật variant
  static async updateVariant(id, data) {
    const variant = await VariantModel.getVariantById(id);
    if (!variant) {
      throw new Error("Không tìm thấy biến thể sản phẩm");
    }

    // Kiểm tra giá thêm hợp lệ
    if (data.additionalPrice < 0) {
      throw new Error("Giá thêm không được âm");
    }

    const success = await VariantModel.updateVariant(id, data);
    if (!success) {
      throw new Error("Cập nhật biến thể thất bại");
    }

    return await VariantModel.getVariantById(id);
  }

  // Xóa variant
  static async deleteVariant(id) {
    const variant = await VariantModel.getVariantById(id);
    if (!variant) {
      throw new Error("Không tìm thấy biến thể sản phẩm");
    }

    // Kiểm tra xem variant có đang được sử dụng không
    const usage = await VariantModel.checkVariantUsage(id);
    if (usage.inCart || usage.inOrders) {
      throw new Error(
        "Không thể xóa biến thể đang được sử dụng trong giỏ hàng hoặc đơn hàng"
      );
    }

    const success = await VariantModel.deleteVariant(id);
    if (!success) {
      throw new Error("Xóa biến thể thất bại");
    }

    return { message: "Xóa biến thể thành công" };
  }
}

export default VariantService;
