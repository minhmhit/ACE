import express from "express";
import InventoryController from "../controllers/InventoryController.js";
import {
  updateInventoryValidation,
  checkInventoryValidation,
  lowStockValidation,
} from "../middlewares/inventoryValidation.js";
import { validateResult } from "../middlewares/validator.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Middleware xác thực cho nhân viên kho
const warehouseAuth = [authenticate, authorize(1, 3)];

// Xem tồn kho tất cả sản phẩm
router.get("/", warehouseAuth, InventoryController.getAllInventory);

// Lấy danh sách sản phẩm có tồn kho thấp
router.get(
  "/low-stock",
  warehouseAuth,
  lowStockValidation,
  validateResult,
  InventoryController.getLowStockInventory
);

// Xem tồn kho của sản phẩm cụ thể
router.get(
  "/:productId",
  warehouseAuth,
  InventoryController.getProductInventory
);

// Cập nhật số lượng tồn kho
router.put(
  "/:productId",
  warehouseAuth,
  updateInventoryValidation,
  validateResult,
  InventoryController.updateInventory
);

// Kiểm tra tồn kho nhiều sản phẩm
router.post(
  "/check",
  warehouseAuth,
  checkInventoryValidation,
  validateResult,
  InventoryController.checkInventory
);

export default router;
