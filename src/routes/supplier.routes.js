import express from "express";
import SupplierController from "../controllers/SupplierController.js";
import {
  supplierValidation, updateSupplierValidation
} from "../middlewares/supplierValidation.js";
import { validateResult } from "../middlewares/validator.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Middleware xác thực cho admin
const adminAuth = [authenticate, authorize(1,3)];

// Danh sách nhà cung cấp
router.get("/", adminAuth, SupplierController.getAllSuppliers);

// Chi tiết nhà cung cấp
router.get("/:id", adminAuth, SupplierController.getSupplierById);

// Thêm nhà cung cấp mới
router.post(
  "/add",
  adminAuth,
  supplierValidation,
  validateResult,
  SupplierController.createSupplier
);

// Cập nhật thông tin nhà cung cấp
router.put(
  "/update/:id",
  adminAuth,
  updateSupplierValidation,
  validateResult,
  SupplierController.updateSupplier
);

// Xóa nhà cung cấp
router.delete("/delete/:id", adminAuth, SupplierController.deleteSupplier);

export default router;
