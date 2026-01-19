import express from "express";
import PaymentController from "../controllers/PaymentController.js";
import { createVnpayPaymentValidation } from "../middlewares/paymentValidation.js";
import { validateResult } from "../middlewares/validator.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   POST /api/v1/payment/vnpay/create
 * @desc    Tạo URL thanh toán VNPay cho đơn hàng
 * @access  Private (User đã đăng nhập)
 */
router.post(
  "/vnpay/create",
  authenticate,
  createVnpayPaymentValidation,
  validateResult,
  PaymentController.createVnpayPayment
);


router.get("/vnpay/return", PaymentController.handleVnpayReturn);
router.get("/vnpay/result/:orderId", PaymentController.getPaymentResult);

/**
 * @route   GET /api/v1/payment/vnpay/ipn
 * @desc    VNPay gọi IPN để thông báo kết quả thanh toán (server-to-server)
 * @access  Public (VNPay callback)
 */
router.get("/vnpay/ipn", PaymentController.handleVnpayIPN);

/**
 * @route   GET /api/v1/payment/vnpay/query/:orderId
 * @desc    Query thông tin giao dịch từ VNPay
 * @access  Private (User đã đăng nhập)
 */
router.get(
  "/vnpay/query/:orderId",
  authenticate,
  PaymentController.queryTransaction
);

/**
 * @route   GET /api/v1/payment/history
 * @desc    Lấy lịch sử thanh toán của user
 * @access  Private (User đã đăng nhập)
 */
router.get("/history", authenticate, PaymentController.getPaymentHistory);

export default router;
