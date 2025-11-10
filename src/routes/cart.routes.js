import express from "express";
import CartController from "../controllers/CartController.js";
import {
  addToCartValidation,
  updateCartItemValidation,
} from "../middlewares/cartValidation.js";
import { verifyToken } from "../middlewares/auth.js";
import { validateResult } from "../middlewares/validator.js";

const router = express.Router();

// Route xem giỏ hàng
router.get("/", verifyToken, CartController.getCart);

// Route thêm vào giỏ hàng
router.post(
  "/add",
  verifyToken,
  addToCartValidation,
  validateResult,
  CartController.addToCart
);

// Route cập nhật số lượng sản phẩm trong giỏ
router.put(
  "/update/:cartItemId",
  verifyToken,
  updateCartItemValidation,
  validateResult,
  CartController.updateCartItem
);

// Route xóa sản phẩm khỏi giỏ
router.delete(
  "/remove/:cartItemId",
  verifyToken,
  CartController.removeFromCart
);

// Route xóa toàn bộ giỏ hàng
router.delete("/clear", verifyToken, CartController.clearCart);

export default router;
