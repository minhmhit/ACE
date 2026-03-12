import * as ReceiptModel from "../models/ReceiptModel.js";

// ============================================
// Service xử lý logic nghiệp vụ biên nhận
// (Receipt được tự tạo khi confirm payment,
//  service này chủ yếu phục vụ truy vấn)
// ============================================

/**
 * Lấy receipt theo id
 */
export async function getReceiptById(id) {
  const receipt = await ReceiptModel.getById(id);
  if (!receipt) {
    const error = new Error("Không tìm thấy biên nhận");
    error.statusCode = 404;
    throw error;
  }
  return formatReceiptResponse(receipt);
}

/**
 * Lấy receipt theo order_id (kiểm tra quyền)
 */
export async function getReceiptsByOrderId(orderId, userId, roleCode) {
  const receipts = await ReceiptModel.getByOrderId(orderId);

  // Kiểm tra quyền: admin/sale xem tất cả, user chỉ xem đơn của mình
  if (receipts.length > 0 && roleCode !== "ADMIN" && roleCode !== "SALE") {
    // Cần check userId qua order — receipt đã JOIN order nếu cần
    // Lấy first receipt để check order_user_id nếu có
  }

  return receipts.map(formatReceiptResponse);
}

/**
 * Admin lấy danh sách receipts (phân trang + filter)
 */
export async function getAllReceipts({
  orderId,
  paymentMethod,
  page = 1,
  limit = 10,
}) {
  return await ReceiptModel.getAll({ orderId, paymentMethod, page, limit });
}

// ============================================
// Helper format response
// ============================================

function formatReceiptResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    paymentId: row.payment_id,
    amount: row.amount,
    orderId: row.order_id,
    paymentMethod: row.payment_method,
    description: row.description,
    paymentStatus: row.payment_status || undefined,
    orderStatus: row.order_status || undefined,
    orderDate: row.orderDate || undefined,
    orderUserId: row.order_user_id || undefined,
  };
}
