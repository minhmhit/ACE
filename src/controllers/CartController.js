import { validationResult } from "express-validator";
import * as CartService from "../services/CartService.js";

/**
 * Controller xem giỏ hàng
 */
export async function getCart(req, res, next) {
  try {
    const cart = await CartService.getCart(req.user.id);
    res.json({
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller thêm sản phẩm vào giỏ
 */
export async function addToCart(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const cart = await CartService.addToCart(req.user.id, req.body);
    res.json({
      message: "Thêm sản phẩm vào giỏ thành công",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller cập nhật số lượng sản phẩm
 */
export async function updateCartItem(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { quantity } = req.body;

    const cart = await CartService.updateCartItem(req.user.id, id, quantity);
    res.json({
      message: "Cập nhật số lượng thành công",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller xóa sản phẩm khỏi giỏ
 */
export async function removeFromCart(req, res, next) {
  try {
    const { id } = req.params;
    const cart = await CartService.removeFromCart(req.user.id, id);
    res.json({
      message: "Xóa sản phẩm khỏi giỏ thành công",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller xóa toàn bộ giỏ hàng
 */
export async function clearCart(req, res, next) {
  try {
    const cart = await CartService.clearCart(req.user.id);
    res.json({
      message: "Xóa giỏ hàng thành công",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

