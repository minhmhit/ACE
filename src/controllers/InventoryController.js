import InventoryService from "../services/InventoryService.js";

class InventoryController {
  // Xem tồn kho tất cả sản phẩm
  static async getAllInventory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const inventory = await InventoryService.getAllInventory(page, limit);
      res.json({
        success: true,
        data: {
          inventory,
          pagination: {
            page,
            limit,
            total: inventory[0]?.total_count || 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Xem tồn kho của sản phẩm cụ thể
  static async getProductInventory(req, res, next) {
    try {
      const { productId } = req.params;
      const inventory = await InventoryService.getProductInventory(productId);
      res.json({
        success: true,
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật số lượng tồn kho
  static async updateInventory(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;

      const inventory = await InventoryService.updateInventory(
        productId,
        quantity
      );
      res.json({
        success: true,
        message: "Cập nhật tồn kho thành công",
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  }

  // Kiểm tra tồn kho nhiều sản phẩm
  static async checkInventory(req, res, next) {
    try {
      const { productIds } = req.body;
      const inventory = await InventoryService.checkInventory(productIds);
      res.json({
        success: true,
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  }

  // Lấy danh sách sản phẩm có tồn kho thấp
  static async getLowStockInventory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const threshold = parseInt(req.query.threshold) || 20;

      const inventory = await InventoryService.getLowStockInventory(
        threshold,
        page,
        limit
      );
      res.json({
        success: true,
        data: {
          inventory,
          pagination: {
            page,
            limit,
            threshold,
            total: inventory[0]?.total_count || 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default InventoryController;
