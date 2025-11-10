import ImportService from "../services/ImportService.js";

class ImportController {
  // Lấy danh sách phiếu nhập
  static async getAllImports(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const imports = await ImportService.getAllImports(page, limit);
      res.json({
        success: true,
        data: {
          imports,
          pagination: {
            page,
            limit,
            total: imports[0]?.total_count || 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Lấy chi tiết phiếu nhập
  static async getImportById(req, res, next) {
    try {
      const { id } = req.params;
      const importData = await ImportService.getImportById(id);
      res.json({
        success: true,
        data: importData,
      });
    } catch (error) {
      next(error);
    }
  }

  // Tạo phiếu nhập mới
  static async createImport(req, res, next) {
    try {
      const { importData, details } = req.body;
      const newImport = await ImportService.createImport(importData, details);
      res.status(201).json({
        success: true,
        message: "Tạo phiếu nhập thành công",
        data: newImport,
      });
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật trạng thái thanh toán
  static async updatePaymentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const importData = await ImportService.updatePaymentStatus(id, status);
      res.json({
        success: true,
        message: "Cập nhật trạng thái thanh toán thành công",
        data: importData,
      });
    } catch (error) {
      next(error);
    }
  }

  // Xóa phiếu nhập
  static async deleteImport(req, res, next) {
    try {
      const { id } = req.params;
      await ImportService.deleteImport(id);
      res.json({
        success: true,
        message: "Xóa phiếu nhập thành công",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ImportController;
