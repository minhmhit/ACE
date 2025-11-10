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
router.get("/products", ProductController.getProducts);
router.get("/products/search", ProductController.searchProducts);
router.get("/products/:id", ProductController.getProductById);
router.get("/products/:id/variants", ProductController.getProductVariants);

// Admin only routes
router.post(
  "/products",
  authenticate,
  authorize(1),
  createProductValidation,
  ProductController.createProduct
);

router.put(
  "/products/:id",
  authenticate,
  authorize(1),
  updateProductValidation,
  ProductController.updateProduct
);

router.delete(
  "/products/:id",
  authenticate,
  authorize(1),
  ProductController.deleteProduct
);

// Variant routes
router.post(
  "/products/:id/variants",
  authenticate,
  authorize(1),
  createVariantValidation,
  ProductController.createVariant
);

router.put(
  "/variants/:id",
  authenticate,
  authorize([1]),
  updateVariantValidation,
  ProductController.updateVariant
);

router.delete(
  "/variants/:id",
  authenticate,
  authorize([1]),
  ProductController.deleteVariant
);

export default router;
