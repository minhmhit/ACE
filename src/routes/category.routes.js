import express from "express";
import * as CategoryController from "../controllers/CategoryController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createCategoryValidation,
  updateCategoryValidation,
} from "../middlewares/categoryValidation.js";

const router = express.Router();

// Public routes
router.get("/", CategoryController.getCategories);
router.get("/:id", CategoryController.getCategoryById);

// Admin only routes
router.post(
  "/add",
  authenticate,
  authorize(1,3),
  createCategoryValidation,
  CategoryController.createCategory
);

router.put(
  "/update/:id",
  authenticate,
  authorize(1,3),
  updateCategoryValidation,
  CategoryController.updateCategory
);

router.delete(
  "/delete/:id",
  authenticate,
  authorize(1,3),
  CategoryController.deleteCategory
);

export default router;
