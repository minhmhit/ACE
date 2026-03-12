// Route Dashboard — định nghĩa endpoint thống kê, chỉ ADMIN được truy cập
import express from "express";
import DashboardController from "../controllers/DashboardController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Tất cả route dashboard yêu cầu đăng nhập + quyền ADMIN
router.use(authenticate, authorize("ADMIN"));

// Thống kê doanh thu
router.get("/sales", DashboardController.getSalesStats);

// Thống kê đơn hàng
router.get("/orders", DashboardController.getOrderStats);

// Top sản phẩm bán chạy
router.get("/products/top", DashboardController.getTopProducts);

// Sản phẩm tồn kho thấp
router.get("/products/low-stock", DashboardController.getLowStockProducts);

// Thống kê nhân sự
router.get("/hr", DashboardController.getHrStats);

// Thống kê lương
router.get("/payroll", DashboardController.getPayrollStats);

// Tổng quan hệ thống
router.get("/overview", DashboardController.getOverview);

export default router;
