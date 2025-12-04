import { pool } from "../config/db.js";

class SupplierModel {
  // Lấy danh sách nhà cung cấp với phân trang
  static async getAllSuppliers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT id, name, address, code, contactInfo, isActive 
       FROM suppliers 
       ORDER BY id DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM suppliers`
    );

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  // Lấy chi tiết nhà cung cấp kèm sản phẩm
  static async getSupplierById(id) {
    const [rows] = await pool.query(
      `SELECT id, name, address, code, contactInfo, isActive
       FROM suppliers 
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const supplier = rows[0];

    // Lấy danh sách sản phẩm của nhà cung cấp
    const [products] = await pool.query(
      `SELECT id, name, price, imageUrl 
       FROM products 
       WHERE supplierId = ?`,
      [id]
    );

    supplier.products = products;

    return supplier;
  }

  // Kiểm tra mã code đã tồn tại
  static async checkCodeExists(code, excludeId = null) {
    let query = `SELECT id FROM suppliers WHERE code = ?`;
    let params = [code];

    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }

    const [rows] = await pool.query(query, params);
    return rows.length > 0;
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
    const newSupplier = await this.getSupplierById(result.insertId);

    return newSupplier;
  }

  // Cập nhật thông tin nhà cung cấp
  static async updateSupplier(id, supplierData) {
    // Kiểm tra nhà cung cấp có tồn tại không
    const [existing] = await pool.query(
      `SELECT id FROM suppliers WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      throw new Error("Không tìm thấy nhà cung cấp");
    }

    // Kiểm tra mã code trùng lặp (ngoại trừ chính nó)
    if (supplierData.code) {
      const codeExists = await this.checkCodeExists(supplierData.code, id);
      if (codeExists) {
        throw new Error("Mã nhà cung cấp đã tồn tại");
      }
    }

    // Tạo câu query động
    const updates = [];
    const values = [];

    if (supplierData.name !== undefined) {
      updates.push("name = ?");
      values.push(supplierData.name);
    }
    if (supplierData.address !== undefined) {
      updates.push("address = ?");
      values.push(supplierData.address);
    }
    if (supplierData.code !== undefined) {
      updates.push("code = ?");
      values.push(supplierData.code);
    }
    if (supplierData.contactInfo !== undefined) {
      updates.push("contactInfo = ?");
      values.push(supplierData.contactInfo);
    }

    if (updates.length === 0) {
      return true; // Không có gì để cập nhật
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE suppliers SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Xóa nhà cung cấp
  static async deleteSupplier(id) {
    // Kiểm tra nhà cung cấp có tồn tại không
    const [existing] = await pool.query(
      `SELECT id FROM suppliers WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      throw new Error("Không tìm thấy nhà cung cấp");
    }

    // Kiểm tra có sản phẩm nào đang sử dụng nhà cung cấp này không
    const [products] = await pool.query(
      `SELECT id FROM products WHERE supplierId = ? LIMIT 1`,
      [id]
    );

    if (products.length > 0) {
      throw new Error("Không thể xóa nhà cung cấp đang có sản phẩm");
    }

    const [result] = await pool.query(`UPDATE suppliers SET isActive = 0 WHERE id = ?`, [id
    ]);
    const data = await this.getSupplierById(id);
    return data;
  }
}

export default SupplierModel;
