import express from "express";
import ImportController from "../controllers/ImportController.js";
import {
  createImportValidation,
  updatePaymentStatusValidation,
} from "../middlewares/importValidation.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

// Lấy danh sách phiếu nhập hàng (có phân trang và lọc)
router.get("/", ImportController.getImports);

// Lấy chi tiết một phiếu nhập hàng
router.get("/:id", ImportController.getImportById);

// Tạo phiếu nhập hàng mới
router.post(
  "/",
  createImportValidation,
  validateRequest,
  ImportController.createImport
);

// Cập nhật trạng thái thanh toán
router.patch(
  "/:id/status",
  updatePaymentStatusValidation,
  validateRequest,
  ImportController.updatePaymentStatus
);

// Xoá phiếu nhập hàng (chỉ cho phép xoá khi chưa thanh toán)
router.delete("/:id", ImportController.deleteImport);

export default router;
