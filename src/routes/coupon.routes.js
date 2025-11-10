import express from "express";
import CouponController from "../controllers/CouponController.js";
import {
  createCouponValidation,
  verifyCouponValidation,
} from "../middlewares/couponValidation.js";
import { validateResult } from "../middlewares/validator.js";
import { verifyToken, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public route
router.post(
  "/verify",
  verifyCouponValidation,
  validateResult,
  CouponController.verifyCoupon
);

// Admin routes
const adminAuth = [verifyToken, isAdmin];

router.get("/", adminAuth, CouponController.getAllCoupons);

router.post(
  "/",
  adminAuth,
  createCouponValidation,
  validateResult,
  CouponController.createCoupon
);

router.put(
  "/:id",
  adminAuth,
  createCouponValidation,
  validateResult,
  CouponController.updateCoupon
);

router.delete("/:id", adminAuth, CouponController.deleteCoupon);

export default router;
