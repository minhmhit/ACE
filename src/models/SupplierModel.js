import {pool} from "../config/db.js";

class SupplierModel {
  // Lấy danh sách nhà cung cấp
  static async getAllSuppliers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [suppliers] = await pool.query(
      `SELECT *, 
              COUNT(*) OVER() as total_count
       FROM suppliers
       ORDER BY name
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return suppliers;
  }

  // Lấy chi tiết nhà cung cấp
  static async getSupplierById(id) {
    const [supplier] = await pool.query(
      `SELECT s.*, 
              COUNT(p.id) as total_products,
              JSON_ARRAYAGG(JSON_OBJECT('id', p.id, 'name', p.name)) as products
       FROM suppliers s
       LEFT JOIN products p ON p.supplierId = s.id
       WHERE s.id = ?
       GROUP BY s.id`,
      [id]
    );
    return supplier[0];
  }

  // Kiểm tra mã code đã tồn tại
  static async checkCodeExists(code, excludeId = null) {
    const [result] = await pool.query(
      "SELECT id FROM suppliers WHERE code = ? AND id != COALESCE(?, -1)",
      [code, excludeId]
    );
    return result.length > 0;
  }

  // Thêm nhà cung cấp mới
  static async createSupplier(supplierData) {
    const { name, address, code, contactInfo } = supplierData;

    // Kiểm tra code đã tồn tại
    const codeExists = await this.checkCodeExists(code);
    if (codeExists) {
      throw new Error("Mã nhà cung cấp đã tồn tại");
    }

    const [result] = await pool.query(
      `INSERT INTO suppliers (name, address, code, contactInfo)
       VALUES (?, ?, ?, ?)`,
      [name, address, code, contactInfo]
    );

    return this.getSupplierById(result.insertId);
  }

  // Cập nhật thông tin nhà cung cấp
  static async updateSupplier(id, supplierData) {
    const { name, address, code, contactInfo } = supplierData;

    // Kiểm tra code đã tồn tại (trừ supplier hiện tại)
    const codeExists = await this.checkCodeExists(code, id);
    if (codeExists) {
      throw new Error("Mã nhà cung cấp đã tồn tại");
    }

    const [result] = await pool.query(
      `UPDATE suppliers 
       SET name = ?, address = ?, code = ?, contactInfo = ?
       WHERE id = ?`,
      [name, address, code, contactInfo, id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Không tìm thấy nhà cung cấp");
    }

    return this.getSupplierById(id);
  }

  // Xóa nhà cung cấp
  static async deleteSupplier(id) {
    // Kiểm tra nhà cung cấp có sản phẩm không
    const [products] = await pool.query(
      "SELECT COUNT(*) as count FROM products WHERE supplierId = ?",
      [id]
    );

    if (products[0].count > 0) {
      throw new Error("Không thể xóa nhà cung cấp đang có sản phẩm");
    }

    const [result] = await pool.query("DELETE FROM suppliers WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Không tìm thấy nhà cung cấp");
    }

    return true;
  }
}

export default SupplierModel;
