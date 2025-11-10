import ImportModel from "../models/ImportModel.js";

class ImportService {
  // Lấy danh sách phiếu nhập
  static async getAllImports(page, limit) {
    try {
      return await ImportModel.getAllImports(page, limit);
    } catch (error) {
      throw error;
    }
  }

  // Lấy chi tiết phiếu nhập
  static async getImportById(id) {
    try {
      const importData = await ImportModel.getImportById(id);
      if (!importData) {
        throw new Error("Không tìm thấy phiếu nhập");
      }
      return importData;
    } catch (error) {
      throw error;
    }
  }

  // Tạo phiếu nhập mới
  static async createImport(importData, details) {
    try {
      // Validate dữ liệu
      if (!importData.supplier_id) {
        throw new Error("Thiếu thông tin nhà cung cấp");
      }

      if (!Array.isArray(details) || details.length === 0) {
        throw new Error("Phải có ít nhất một sản phẩm");
      }

      for (const detail of details) {
        if (!detail.product_id || !detail.quantity || !detail.unit_price) {
          throw new Error("Thiếu thông tin sản phẩm nhập");
        }
        if (detail.quantity <= 0) {
          throw new Error("Số lượng sản phẩm phải lớn hơn 0");
        }
        if (detail.unit_price <= 0) {
          throw new Error("Đơn giá sản phẩm phải lớn hơn 0");
        }
      }

      return await ImportModel.createImport(importData, details);
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái thanh toán
  static async updatePaymentStatus(id, status) {
    try {
      const validStatuses = ["pending", "paid", "cancelled"];
      if (!validStatuses.includes(status)) {
        throw new Error("Trạng thái thanh toán không hợp lệ");
      }

      return await ImportModel.updatePaymentStatus(id, status);
    } catch (error) {
      throw error;
    }
  }

  // Xóa phiếu nhập
  static async deleteImport(id) {
    try {
      return await ImportModel.deleteImport(id);
    } catch (error) {
      throw error;
    }
  }
}

export default ImportService;
