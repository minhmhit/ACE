import express from "express";
import ImportController from "../controllers/ImportController.js";
import {
  createImportValidation,
  updatePaymentStatusValidation,
} from "../middlewares/importValidation.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

const importAuth = [authenticate, authorize(1,3)];

// Lấy danh sách phiếu nhập hàng (có phân trang và lọc)
router.get("/", importAuth, ImportController.getAllImports);

// Lấy chi tiết một phiếu nhập hàng
router.get("/:id", importAuth, ImportController.getImportById);

// Tạo phiếu nhập hàng mới
router.post(
  "/add",
  createImportValidation,
  importAuth,
  validateRequest,
  ImportController.createImport
);

// Cập nhật trạng thái thanh toán
router.patch(
  "/:id/status",
  updatePaymentStatusValidation,
  importAuth,
  validateRequest,
  ImportController.updatePaymentStatus
);

// Xoá phiếu nhập hàng (chỉ cho phép xoá khi chưa thanh toán)
router.delete("/:id", importAuth, ImportController.deleteImport);

export default router;
