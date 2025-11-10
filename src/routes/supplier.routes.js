import express from "express";
import SupplierController from "../controllers/SupplierController.js";
import supplierValidation from "../middlewares/supplierValidation.js";
import { validateResult } from "../middlewares/validator.js";
import { verifyToken, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Middleware xác thực cho admin
const adminAuth = [verifyToken, isAdmin];

// Danh sách nhà cung cấp
router.get("/", adminAuth, SupplierController.getAllSuppliers);

// Chi tiết nhà cung cấp
router.get("/:id", adminAuth, SupplierController.getSupplierById);

// Thêm nhà cung cấp mới
router.post(
  "/",
  adminAuth,
  supplierValidation,
  validateResult,
  SupplierController.createSupplier
);

// Cập nhật thông tin nhà cung cấp
router.put(
  "/:id",
  adminAuth,
  supplierValidation,
  validateResult,
  SupplierController.updateSupplier
);

// Xóa nhà cung cấp
router.delete("/:id", adminAuth, SupplierController.deleteSupplier);

export default router;
