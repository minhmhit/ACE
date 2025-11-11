import express from "express";
import OrderController from "../controllers/OrderController.js";
import {
  createOrderValidation,
  updateOrderStatusValidation,
} from "../middlewares/orderValidation.js";
import { validateResult } from "../middlewares/validator.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// User routes
router.post(
  "/add",
  authenticate,
  createOrderValidation,
  validateResult,
  OrderController.createOrder
);

router.get("/", authenticate, OrderController.getOrders);

router.get("/:id", authenticate, OrderController.getOrderById);

router.put("/:id/cancel", authenticate, OrderController.cancelOrder);

// Admin routes
router.get("/admin/all", authenticate,authorize(1,4), OrderController.getAllOrders);

router.put(
  "/:id/status",
  authenticate,
  authorize(1,4),
  updateOrderStatusValidation,
  validateResult,
  OrderController.updateOrderStatus
);

export default router;
