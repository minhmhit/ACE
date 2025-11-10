import ReceiptService from "../services/ReceiptService.js";

class ReceiptController {
  // Tạo phiếu thu mới
  static async createReceipt(req, res) {
    try {
      const receiptData = {
        amount: req.body.amount,
        order_id: req.body.order_id,
        payment_method: req.body.payment_method,
        description: req.body.description,
      };

      const receipt = await ReceiptService.createReceipt(receiptData);
      res.status(201).json({
        message: "Tạo phiếu thu thành công",
        data: receipt,
      });
    } catch (error) {
      res.status(400).json({
        error: "Tạo phiếu thu thất bại",
        message: error.message,
      });
    }
  }

  // Lấy danh sách phiếu thu
  static async getReceipts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        payment_method: req.query.payment_method,
      };

      const result = await ReceiptService.getReceipts(page, limit, filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: "Lấy danh sách phiếu thu thất bại",
        message: error.message,
      });
    }
  }

  // Lấy chi tiết phiếu thu
  static async getReceiptById(req, res) {
    try {
      const receipt = await ReceiptService.getReceiptById(req.params.id);
      res.json(receipt);
    } catch (error) {
      res.status(404).json({
        error: "Không tìm thấy phiếu thu",
        message: error.message,
      });
    }
  }

  // Cập nhật ghi chú phiếu thu
  static async updateReceipt(req, res) {
    try {
      const updates = {
        description: req.body.description,
      };

      const receipt = await ReceiptService.updateReceipt(
        req.params.id,
        updates
      );
      res.json({
        message: "Cập nhật phiếu thu thành công",
        data: receipt,
      });
    } catch (error) {
      res.status(400).json({
        error: "Cập nhật phiếu thu thất bại",
        message: error.message,
      });
    }
  }

  // Xóa phiếu thu
  static async deleteReceipt(req, res) {
    try {
      const result = await ReceiptService.deleteReceipt(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: "Xóa phiếu thu thất bại",
        message: error.message,
      });
    }
  }
}

export default ReceiptController;
