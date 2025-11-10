import express from "express";
import * as CategoryController from "../controllers/CategoryController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createCategoryValidation,
  updateCategoryValidation,
} from "../middlewares/categoryValidation.js";

const router = express.Router();

// Public routes
router.get("/categories", CategoryController.getCategories);
router.get("/categories/:id", CategoryController.getCategoryById);

// Admin only routes
router.post(
  "/categories",
  authenticate,
  authorize([1]),
  createCategoryValidation,
  CategoryController.createCategory
);

router.put(
  "/categories/:id",
  authenticate,
  authorize([1]),
  updateCategoryValidation,
  CategoryController.updateCategory
);

router.delete(
  "/categories/:id",
  authenticate,
  authorize([1]),
  CategoryController.deleteCategory
);

export default router;
