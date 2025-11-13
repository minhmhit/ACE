import express from "express";
import * as ProductController from "../controllers/ProductController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createProductValidation,
  updateProductValidation,
  createVariantValidation,
  updateVariantValidation,
} from "../middlewares/productValidation.js";

const router = express.Router();

// Public routes
router.get("/", ProductController.getAllProducts);
router.get("/search", ProductController.searchProducts);
router.get("/:id", ProductController.getProductById);

// Admin only routes
router.post(
  "/add",
  authenticate,
  authorize(1,3),
  createProductValidation,
  ProductController.createProduct
);

router.put(
  "/update/:id",
  authenticate,
  authorize(1,3),
  updateProductValidation,
  ProductController.updateProduct
);

router.delete(
  "/delete/:id",
  authenticate,
  authorize(1,3),
  ProductController.deleteProduct
);

// Variant routes
router.post(
  "/products/:id/variants",
  authenticate,
  authorize(1,3),
  createVariantValidation,
  ProductController.createVariant
);

router.put(
  "/variants/:id",
  authenticate,
  authorize(1,3),
  updateVariantValidation,
  ProductController.updateVariant
);

router.delete(
  "/variants/:id",
  authenticate,
  authorize(1,3),
  ProductController.deleteVariant
);

export default router;
