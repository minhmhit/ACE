import express from "express";
import VariantController from "../controllers/VariantController.js";
import {
  createVariantValidation,
  updateVariantValidation,
} from "../middlewares/variantValidation.js";
import { validateResult } from "../middlewares/validator.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Lấy tất cả variants của một sản phẩm
router.get("/product/:productId", VariantController.getProductVariants);

// Lấy chi tiết một variant
router.get("/:id", VariantController.getVariantById);

// Tạo variant mới (yêu cầu đăng nhập admin)
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createVariantValidation,
  validateResult,
  VariantController.createVariant,
);

// Cập nhật variant (yêu cầu đăng nhập admin)
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updateVariantValidation,
  validateResult,
  VariantController.updateVariant,
);

// Xóa variant (yêu cầu đăng nhập admin)
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  VariantController.deleteVariant,
);
export default router;
