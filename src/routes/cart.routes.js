import express from "express";
import * as CartController from "../controllers/CartController.js";
import {
  addToCartValidation,
  updateCartItemValidation,
} from "../middlewares/cartValidation.js";
import { authenticate } from "../middlewares/auth.js";
import { validateResult } from "../middlewares/validator.js";

const router = express.Router();

// Route xem giỏ hàng
router.get("/", authenticate, CartController.getCart);

// Route thêm vào giỏ hàng
router.post(
  "/add",
  authenticate,
  addToCartValidation,
  validateResult,
  CartController.addToCart
);

// Route cập nhật số lượng sản phẩm trong giỏ
router.put(
  "/update/:id",
  authenticate,
  updateCartItemValidation,
  validateResult,
  CartController.updateCartItem
);

// Route xóa sản phẩm khỏi giỏ
router.delete(
  "/remove/:id",
  authenticate,
  CartController.removeFromCart
);

// Route xóa toàn bộ giỏ hàng
router.delete("/clear", authenticate, CartController.clearCart);

export default router;
