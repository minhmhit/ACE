import express from "express";
import * as ReceiptController from "../controllers/ReceiptController.js";
import {
  receiptIdValidation,
  receiptOrderIdValidation,
  getReceiptsValidation,
} from "../middlewares/receiptValidation.js";
import { validateResult } from "../middlewares/validator.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Lấy receipts theo order
router.get(
  "/order/:orderId",
  authenticate,
  receiptOrderIdValidation,
  validateResult,
  ReceiptController.getReceiptsByOrderId,
);

// Admin lấy danh sách receipts
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SALE"),
  getReceiptsValidation,
  validateResult,
  ReceiptController.getAllReceipts,
);

// Lấy receipt theo id
router.get(
  "/:id",
  authenticate,
  receiptIdValidation,
  validateResult,
  ReceiptController.getReceiptById,
);

export default router;
