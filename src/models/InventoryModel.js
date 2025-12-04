import { pool } from "../config/db.js";

class InventoryModel {
  // Lấy danh sách tồn kho tất cả sản phẩm
  static async getAllInventory(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [inventory] = await pool.query(
      `SELECT i.*, p.name as product_name, p.description,
              COUNT(*) OVER() as total_count
       FROM inventories i
       JOIN products p ON i.productId = p.id
       ORDER BY p.name
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return inventory;
  }

  // Lấy thông tin tồn kho của một sản phẩm
  static async getProductInventory(productId) {
    const [inventory] = await pool.query(
      `SELECT i.*, p.name as product_name, p.description
       FROM inventories i
       JOIN products p ON i.productId = p.id
       WHERE i.productId = ?`,
      [productId]
    );
    return inventory[0];
  }

  // Cập nhật số lượng tồn kho
  static async updateInventory(productId, quantity) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Kiểm tra sản phẩm tồn tại
      const [product] = await conn.query(
        "SELECT id FROM products WHERE id = ?",
        [productId]
      );

      if (product.length === 0) {
        throw new Error("Sản phẩm không tồn tại");
      }

      // Kiểm tra và cập nhật inventory
      const [inventory] = await conn.query(
        "SELECT id FROM inventories WHERE productId = ?",
        [productId]
      );

      if (inventory.length === 0) {
        // Tạo mới nếu chưa có
        await conn.query(
          "INSERT INTO inventories (productId, quantity) VALUES (?, ?)",
          [productId, quantity]
        );
      } else {
        // Cập nhật nếu đã tồn tại
        await conn.query(
          "UPDATE inventories SET quantity = ? WHERE productId = ?",
          [quantity, productId]
        );
      }

      await conn.commit();
      return await this.getProductInventory(productId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Kiểm tra tồn kho nhiều sản phẩm
  static async checkInventory(productIds) {
    const [inventory] = await pool.query(
      `SELECT i.*, p.name as product_name
       FROM inventories i
       JOIN products p ON i.productId = p.id
       WHERE i.productId IN (?)`,
      [productIds]
    );
    return inventory;
  }

  // Kiểm tra đủ số lượng tồn kho cho danh sách sản phẩm
  static async checkInventoryAvailability(items) {
    const productIds = items.map((item) => item.productId);
    const [inventory] = await pool.query(
      `SELECT i.productId, i.quantity
       FROM inventories i
       WHERE i.productId IN (?)`,
      [productIds]
    );

    const inventoryMap = inventory.reduce((map, item) => {
      map[item.productId] = item.quantity;
      return map;
    }, {});

    const unavailableItems = items.filter((item) => {
      const stockQuantity = inventoryMap[item.productId] || 0;
      return stockQuantity < item.quantity;
    });

    return {
      available: unavailableItems.length === 0,
      unavailableItems: unavailableItems.map((item) => ({
        productId: item.productId,
        requestedQuantity: item.quantity,
        availableQuantity: inventoryMap[item.productId] || 0,
      })),
    };
  }

  // Lấy danh sách sản phẩm có tồn kho thấp
  static async getLowStockInventory(threshold = 20, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [inventory] = await pool.query(
      `SELECT i.*, p.name as product_name, p.description, p.imageUrl,
              COUNT(*) OVER() as total_count
       FROM inventories i
       JOIN products p ON i.productId = p.id
       WHERE i.quantity < ?
       ORDER BY i.quantity ASC
       LIMIT ? OFFSET ?`,
      [threshold, limit, offset]
    );
    return inventory;
  }
}

export default InventoryModel;
