import * as ReceiptService from "../services/ReceiptService.js";

// ============================================
// Controller xử lý request/response biên nhận
// (Receipts được tự tạo khi confirm payment)
// ============================================

/**
 * GET /api/v1/receipts/:id
 * Lấy receipt theo id
 */
export async function getReceiptById(req, res, next) {
  try {
    const receipt = await ReceiptService.getReceiptById(
      parseInt(req.params.id),
    );
    res.json({ data: receipt });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/receipts/order/:orderId
 * Lấy receipts của đơn hàng
 */
export async function getReceiptsByOrderId(req, res, next) {
  try {
    const userId = req.user.id;
    const roleCode = req.user.role.code;
    const orderId = parseInt(req.params.orderId);

    const receipts = await ReceiptService.getReceiptsByOrderId(
      orderId,
      userId,
      roleCode,
    );
    res.json({ data: receipts });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/receipts
 * Admin lấy danh sách receipts (phân trang + filter)
 */
export async function getAllReceipts(req, res, next) {
  try {
    const { orderId, paymentMethod, page, limit } = req.query;
    const result = await ReceiptService.getAllReceipts({
      orderId: orderId ? parseInt(orderId) : undefined,
      paymentMethod,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}
