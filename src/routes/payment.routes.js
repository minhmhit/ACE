import express from "express";
import * as PaymentController from "../controllers/PaymentController.js";
import {
  createPaymentValidation,
  getPaymentsValidation,
  paymentIdValidation,
  orderIdValidation,
} from "../middlewares/paymentValidation.js";
import { validateResult } from "../middlewares/validator.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// === Public VNPay callbacks (không cần auth) ===
router.get("/vnpay/return", PaymentController.handleVnpayReturn);
router.get("/vnpay/ipn", PaymentController.handleVnpayIPN);

// === User routes (cần đăng nhập) ===

// Lấy danh sách payment methods
router.get("/methods", authenticate, PaymentController.getPaymentMethods);

// Lịch sử thanh toán của user
router.get("/history", authenticate, PaymentController.getPaymentHistory);

// Tạo payment cho đơn hàng
router.post(
  "/",
  authenticate,
  createPaymentValidation,
  validateResult,
  PaymentController.createPayment,
);

// Lấy payment của đơn hàng (user xem đơn mình, admin/sale xem tất cả)
router.get(
  "/order/:orderId",
  authenticate,
  orderIdValidation,
  validateResult,
  PaymentController.getOrderPayment,
);

// === Admin/Sale routes ===

// Admin lấy danh sách payments
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SALE"),
  getPaymentsValidation,
  validateResult,
  PaymentController.getAllPayments,
);

// Lấy payment theo id
router.get(
  "/:id",
  authenticate,
  paymentIdValidation,
  validateResult,
  PaymentController.getPaymentById,
);

// Admin/Sale xác nhận thanh toán thành công
router.post(
  "/:id/confirm",
  authenticate,
  authorize("ADMIN", "SALE"),
  paymentIdValidation,
  validateResult,
  PaymentController.confirmPayment,
);

// Admin đánh dấu thanh toán thất bại
router.post(
  "/:id/fail",
  authenticate,
  authorize("ADMIN", "SALE"),
  paymentIdValidation,
  validateResult,
  PaymentController.failPayment,
);

// Query giao dịch VNPay
router.get(
  "/vnpay/query/:orderId",
  authenticate,
  authorize("ADMIN", "SALE"),
  orderIdValidation,
  validateResult,
  PaymentController.queryVnpayTransaction,
);

export default router;
