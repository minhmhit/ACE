import express from "express";
import OrderController from "../controllers/OrderController.js";
import {
  createOrderValidation,
  updateOrderStatusValidation,
} from "../middlewares/orderValidation.js";
import { validateResult } from "../middlewares/validator.js";
import { verifyToken, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// User routes
router.post(
  "/",
  verifyToken,
  createOrderValidation,
  validateResult,
  OrderController.createOrder
);

router.get("/", verifyToken, OrderController.getOrders);

router.get("/:id", verifyToken, OrderController.getOrderById);

router.put("/:id/cancel", verifyToken, OrderController.cancelOrder);

// Admin routes
router.get("/admin/all", verifyToken, isAdmin, OrderController.getAllOrders);

router.put(
  "/:id/status",
  verifyToken,
  isAdmin,
  updateOrderStatusValidation,
  validateResult,
  OrderController.updateOrderStatus
);

export default router;
