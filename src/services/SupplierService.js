import SupplierModel from "../models/SupplierModel.js";

class SupplierService {
  // Lấy danh sách nhà cung cấp
  static async getAllSuppliers(page, limit) {
    try {
      return await SupplierModel.getAllSuppliers(page, limit);
    } catch (error) {
      throw error;
    }
  }

  // Lấy chi tiết nhà cung cấp
  static async getSupplierById(id) {
    try {
      const supplier = await SupplierModel.getSupplierById(id);
      if (!supplier) {
        throw new Error("Không tìm thấy nhà cung cấp");
      }
      return supplier;
    } catch (error) {
      throw error;
    }
  }

  // Thêm nhà cung cấp mới
  static async createSupplier(supplierData) {
    const result = await SupplierModel.createSupplier(supplierData);
    return result;
  }

  // Cập nhật thông tin nhà cung cấp
  static async updateSupplier(id, supplierData) {
    try {
      
      return await SupplierModel.updateSupplier(id, supplierData);
    } catch (error) {
      if (
        error.message === "Mã nhà cung cấp đã tồn tại" ||
        error.message === "Không tìm thấy nhà cung cấp"
      ) {
        throw error;
      }
      throw new Error("Không thể cập nhật thông tin nhà cung cấp");
    }
  }

  // Xóa nhà cung cấp
  static async deleteSupplier(id) {
    try {
     const result = await SupplierModel.deleteSupplier(id);
      return result;
    } catch (error) {
      if (
        error.message === "Không thể xóa nhà cung cấp đang có sản phẩm" ||
        error.message === "Không tìm thấy nhà cung cấp"
      ) {
        throw error;
      }
      throw new Error("Không thể xóa nhà cung cấp");
    }
  }
}

export default SupplierService;
