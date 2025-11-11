import axiosInstance from "./axiosConfig";

const receiptAPI = {
  // Lấy danh sách hóa đơn
  getAllReceipts: async (page = 1, limit = 10, paymentMethod = null) => {
    return await axiosInstance.get("/receipts/", {
      params: { page, limit, payment_method: paymentMethod },
    });
  },

  // Lấy chi tiết hóa đơn
  getReceiptById: async (receiptId) => {
    return await axiosInstance.get(`/receipts/${receiptId}`);
  },

  // Tạo hóa đơn mới
  createReceipt: async (receiptData) => {
    return await axiosInstance.post("/receipts/", receiptData);
  },

  // Cập nhật ghi chú hóa đơn
  updateReceipt: async (receiptId, description) => {
    return await axiosInstance.patch(`/receipts/${receiptId}`, { description });
  },

  // Xóa hóa đơn
  deleteReceipt: async (receiptId) => {
    return await axiosInstance.delete(`/receipts/${receiptId}`);
  },
};

export default receiptAPI;
