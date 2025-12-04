import InventoryModel from "../models/InventoryModel.js";

class InventoryService {
  // Lấy danh sách tồn kho tất cả sản phẩm
  static async getAllInventory(page, limit) {
    try {
      return await InventoryModel.getAllInventory(page, limit);
    } catch (error) {
      throw error;
    }
  }

  // Lấy thông tin tồn kho của một sản phẩm
  static async getProductInventory(productId) {
    try {
      const inventory = await InventoryModel.getProductInventory(productId);
      if (!inventory) {
        throw new Error("Không tìm thấy thông tin tồn kho của sản phẩm");
      }
      return inventory;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật số lượng tồn kho
  static async updateInventory(productId, quantity) {
    try {
      if (quantity < 0) {
        throw new Error("Số lượng tồn kho không thể âm");
      }
      return await InventoryModel.updateInventory(productId, quantity);
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra tồn kho nhiều sản phẩm
  static async checkInventory(productIds) {
    try {
      if (!Array.isArray(productIds) || productIds.length === 0) {
        throw new Error("Danh sách sản phẩm không hợp lệ");
      }
      return await InventoryModel.checkInventory(productIds);
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra tồn kho cho đơn hàng
  static async checkInventoryForOrder(items) {
    try {
      const result = await InventoryModel.checkInventoryAvailability(items);
      if (!result.available) {
        const errorMessage = result.unavailableItems
          .map(
            (item) =>
              `Sản phẩm ID ${item.productId}: yêu cầu ${item.requestedQuantity}, tồn kho ${item.availableQuantity}`
          )
          .join("; ");
        throw new Error(`Không đủ số lượng tồn kho: ${errorMessage}`);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách sản phẩm có tồn kho thấp
  static async getLowStockInventory(threshold, page, limit) {
    try {
      if (threshold && threshold <= 0) {
        throw new Error("Ngưỡng tồn kho phải lớn hơn 0");
      }
      return await InventoryModel.getLowStockInventory(threshold, page, limit);
    } catch (error) {
      throw error;
    }
  }
}

export default InventoryService;
