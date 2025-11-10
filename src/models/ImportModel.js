import {pool} from "../config/db.js";

class ImportModel {
  // Lấy danh sách phiếu nhập hàng
  static async getAllImports(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [imports] = await pool.query(
      `SELECT i.*, s.name as supplier_name,
              COUNT(*) OVER() as total_count
       FROM imports i
       JOIN suppliers s ON i.supplier_id = s.id
       ORDER BY i.import_date DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return imports;
  }

  // Lấy chi tiết phiếu nhập hàng
  static async getImportById(id) {
    const conn = await pool.getConnection();
    try {
      // Lấy thông tin phiếu nhập
      const [import_data] = await conn.query(
        `SELECT i.*, s.name as supplier_name, s.code as supplier_code
         FROM imports i
         JOIN suppliers s ON i.supplier_id = s.id
         WHERE i.id = ?`,
        [id]
      );

      if (import_data.length === 0) return null;

      // Lấy chi tiết các sản phẩm nhập
      const [details] = await conn.query(
        `SELECT id.*, p.name as product_name
         FROM import_details id
         JOIN products p ON id.product_id_imports = p.id
         WHERE id.import_id = ?`,
        [id]
      );

      return {
        ...import_data[0],
        details,
      };
    } finally {
      conn.release();
    }
  }

  // Tạo phiếu nhập hàng mới
  static async createImport(importData, details) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Tạo phiếu nhập
      const [import_result] = await conn.query(
        `INSERT INTO imports (supplier_id, total_amount, payment_status)
         VALUES (?, ?, ?)`,
        [
          importData.supplier_id,
          importData.total_amount || 0,
          importData.payment_status || "pending",
        ]
      );

      const importId = import_result.insertId;

      // Thêm chi tiết sản phẩm
      for (const detail of details) {
        await conn.query(
          `INSERT INTO import_details (import_id, product_id_imports, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [importId, detail.product_id, detail.quantity, detail.unit_price]
        );

        // Cập nhật số lượng trong inventory
        await conn.query(
          `INSERT INTO inventories (productId, quantity)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
          [detail.product_id, detail.quantity, detail.quantity]
        );
      }

      // Cập nhật tổng tiền
      const [total] = await conn.query(
        `SELECT SUM(subtotal) as total 
         FROM import_details 
         WHERE import_id = ?`,
        [importId]
      );

      await conn.query(`UPDATE imports SET total_amount = ? WHERE id = ?`, [
        total[0].total,
        importId,
      ]);

      await conn.commit();
      return this.getImportById(importId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Cập nhật trạng thái thanh toán
  static async updatePaymentStatus(id, status) {
    const [result] = await pool.query(
      `UPDATE imports 
       SET payment_status = ?
       WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Không tìm thấy phiếu nhập");
    }

    return this.getImportById(id);
  }

  // Xóa phiếu nhập hàng (chỉ xóa được khi chưa thanh toán)
  static async deleteImport(id) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Kiểm tra trạng thái thanh toán
      const [import_data] = await conn.query(
        "SELECT payment_status FROM imports WHERE id = ?",
        [id]
      );

      if (import_data.length === 0) {
        throw new Error("Không tìm thấy phiếu nhập");
      }

      if (import_data[0].payment_status === "paid") {
        throw new Error("Không thể xóa phiếu nhập đã thanh toán");
      }

      // Lấy chi tiết để giảm số lượng trong inventory
      const [details] = await conn.query(
        "SELECT product_id_imports, quantity FROM import_details WHERE import_id = ?",
        [id]
      );

      // Giảm số lượng trong inventory
      for (const detail of details) {
        await conn.query(
          `UPDATE inventories 
           SET quantity = quantity - ? 
           WHERE productId = ?`,
          [detail.quantity, detail.product_id_imports]
        );
      }

      // Xóa phiếu nhập (các chi tiết sẽ tự động xóa do có CASCADE)
      await conn.query("DELETE FROM imports WHERE id = ?", [id]);

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

export default ImportModel;
