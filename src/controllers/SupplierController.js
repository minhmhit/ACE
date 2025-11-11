import SupplierService from "../services/SupplierService.js";

class SupplierController {
  // Lấy danh sách nhà cung cấp
  static async getAllSuppliers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const suppliers = await SupplierService.getAllSuppliers(page, limit);
      res.json({
        success: true,        
        suppliers,        
      });
    } catch (error) {
      next(error);
    }
  }

  // Lấy chi tiết nhà cung cấp
  static async getSupplierById(req, res, next) {
    try {
      const { id } = req.params;
      const supplier = await SupplierService.getSupplierById(id);
      res.json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  // Thêm nhà cung cấp mới
  static async createSupplier(req, res, next) {
    try {
      const supplier = await SupplierService.createSupplier(req.body);
      res.status(201).json({
        success: true,
        message: "Tạo nhà cung cấp mới thành công",
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật thông tin nhà cung cấp
  static async updateSupplier(req, res, next) {
    try {
      const { id } = req.params;
      const supplier = await SupplierService.updateSupplier(id, req.body);
      res.json({
        success: true,
        message: "Cập nhật thông tin nhà cung cấp thành công",
      });
    } catch (error) {
      next(error);
    }
  }

  // Xóa nhà cung cấp
  static async deleteSupplier(req, res, next) {
    try {
      const { id } = req.params;
      await SupplierService.deleteSupplier(id);
      res.json({
        success: true,
        message: "Xóa nhà cung cấp thành công",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SupplierController;
