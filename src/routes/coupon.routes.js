import express from "express";
import CouponController from "../controllers/CouponController.js";
import {
  createCouponValidation,
  verifyCouponValidation,
  updateCouponValidation
} from "../middlewares/couponValidation.js";
import { validateResult } from "../middlewares/validator.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Public route
router.post(
  "/verify",
  verifyCouponValidation,
  validateResult,
  CouponController.verifyCoupon
);

// Admin routes
const adminAuth = [authenticate, authorize(1,4)];

router.get("/",  CouponController.getAllCoupons);

router.post(
  "/add",
  adminAuth,
  createCouponValidation,
  validateResult,
  CouponController.createCoupon
);

router.put(
  "/update/:id",
  adminAuth,
  updateCouponValidation,
  validateResult,
  CouponController.updateCoupon
);

router.delete("/delete/:id", adminAuth, CouponController.deleteCoupon);

export default router;
