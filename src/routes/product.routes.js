import express from "express";
import * as ProductController from "../controllers/ProductController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createProductValidation,
  updateProductValidation,
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
  authorize("ADMIN", "WAREHOUSE"),
  createProductValidation,
  ProductController.createProduct,
);

router.put(
  "/update/:id",
  authenticate,
  authorize("ADMIN", "WAREHOUSE"),
  updateProductValidation,
  ProductController.updateProduct,
);

router.delete(
  "/delete/:id",
  authenticate,
  authorize("ADMIN", "WAREHOUSE"),
  ProductController.deleteProduct,
);

export default router;
