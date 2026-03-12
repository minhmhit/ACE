import express from "express";
import ReceiptController from "../controllers/ReceiptController.js";
import {
  createReceiptValidation,
  updateReceiptValidation,
} from "../middlewares/receiptValidation.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

// Lấy danh sách phiếu thu (có phân trang và filter)
router.get("/", ReceiptController.getReceipts);

// Lấy chi tiết phiếu thu
router.get("/:id", ReceiptController.getReceiptById);

// Tạo phiếu thu mới
router.post(
  "/",
  createReceiptValidation,
  validateRequest,
  ReceiptController.createReceipt
);

// Cập nhật ghi chú phiếu thu
router.patch(
  "/:id",
  updateReceiptValidation,
  validateRequest,
  ReceiptController.updateReceipt
);

// Xóa phiếu thu
router.delete("/:id", ReceiptController.deleteReceipt);

export default router;
