import VariantService from "../services/VariantService.js";

class VariantController {
  // Lấy tất cả variants của một sản phẩm
  static async getProductVariants(req, res) {
    try {
      const productId = parseInt(req.params.productId);
      const variants = await VariantService.getProductVariants(productId);
      res.json(variants);
    } catch (error) {
      res.status(404).json({
        error: "Lấy danh sách biến thể thất bại",
        message: error.message,
      });
    }
  }

  // Lấy chi tiết một variant
  static async getVariantById(req, res) {
    try {
      const variant = await VariantService.getVariantById(req.params.id);
      res.json(variant);
    } catch (error) {
      res.status(404).json({
        error: "Không tìm thấy biến thể",
        message: error.message,
      });
    }
  }

  // Tạo variant mới
  static async createVariant(req, res) {
    try {
      const variantData = {
        name: req.body.name,
        productId: req.body.productId,
        additionalPrice: req.body.additionalPrice || 0,
      };

      const variant = await VariantService.createVariant(variantData);
      res.status(201).json({
        message: "Tạo biến thể thành công",
        data: variant,
      });
    } catch (error) {
      res.status(400).json({
        error: "Tạo biến thể thất bại",
        message: error.message,
      });
    }
  }

  // Cập nhật variant
  static async updateVariant(req, res) {
    try {
      const updates = {
        name: req.body.name,
        additionalPrice: req.body.additionalPrice,
      };

      const variant = await VariantService.updateVariant(
        req.params.id,
        updates
      );
      res.json({
        message: "Cập nhật biến thể thành công",
        data: variant,
      });
    } catch (error) {
      res.status(400).json({
        error: "Cập nhật biến thể thất bại",
        message: error.message,
      });
    }
  }

  // Xóa variant
  static async deleteVariant(req, res) {
    try {
      const result = await VariantService.deleteVariant(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: "Xóa biến thể thất bại",
        message: error.message,
      });
    }
  }
}

export default VariantController;
