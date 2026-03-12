import ReceiptModel from "../models/ReceiptModel.js";
import {pool} from "../config/db.js";

class ReceiptService {
  // Tạo phiếu thu mới và cập nhật trạng thái đơn hàng
  static async createReceipt(receiptData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Kiểm tra xem đơn hàng đã thanh toán chưa
      const existingReceipt = await ReceiptModel.getByOrderId(
        receiptData.order_id
      );
      if (existingReceipt) {
        throw new Error("Đơn hàng này đã được thanh toán");
      }

      // Lấy thông tin đơn hàng để kiểm tra
      const [orderRows] = await connection.execute(
        "SELECT status, totalAmount FROM orders WHERE id = ?",
        [receiptData.order_id]
      );

      if (!orderRows[0]) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      const order = orderRows[0];
      if (order.status === "CANCELLED") {
        throw new Error("Không thể thanh toán đơn hàng đã hủy");
      }

      if (order.status === "COMPLETED") {
        throw new Error("Đơn hàng đã hoàn thành và thanh toán");
      }

      // Kiểm tra số tiền thanh toán
      if (receiptData.amount !== order.totalAmount) {
        throw new Error("Số tiền thanh toán không khớp với tổng đơn hàng");
      }

      // Tạo phiếu thu
      const receiptId = await ReceiptModel.create(receiptData);

      // Cập nhật trạng thái đơn hàng thành COMPLETED
      await connection.execute("UPDATE orders SET status = ? WHERE id = ?", [
        "COMPLETED",
        receiptData.order_id,
      ]);

      await connection.commit();

      // Lấy thông tin phiếu thu vừa tạo
      return await ReceiptModel.getById(receiptId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Lấy danh sách phiếu thu có phân trang và filter
  static async getReceipts(page, limit, filters) {
    return await ReceiptModel.getAll(page, limit, filters);
  }

  // Lấy chi tiết phiếu thu
  static async getReceiptById(id) {
    const receipt = await ReceiptModel.getById(id);
    if (!receipt) {
      throw new Error("Không tìm thấy phiếu thu");
    }
    return receipt;
  }

  // Cập nhật ghi chú phiếu thu
  static async updateReceipt(id, updates) {
    const receipt = await ReceiptModel.getById(id);
    if (!receipt) {
      throw new Error("Không tìm thấy phiếu thu");
    }

    // Chỉ cho phép cập nhật description
    const success = await ReceiptModel.update(id, {
      description: updates.description,
    });

    if (!success) {
      throw new Error("Cập nhật phiếu thu thất bại");
    }

    return await ReceiptModel.getById(id);
  }

  // Xóa phiếu thu
  static async deleteReceipt(id) {
    const receipt = await ReceiptModel.getById(id);
    if (!receipt) {
      throw new Error("Không tìm thấy phiếu thu");
    }

    // Chỉ cho phép xóa nếu đơn hàng chưa hoàn thành
    if (receipt.order_status === "COMPLETED") {
      throw new Error("Không thể xóa phiếu thu của đơn hàng đã hoàn thành");
    }

    const success = await ReceiptModel.delete(id);
    if (!success) {
      throw new Error("Xóa phiếu thu thất bại");
    }

    return { message: "Xóa phiếu thu thành công" };
  }
}

export default ReceiptService;
