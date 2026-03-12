import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import { userRouter, adminUserRouter } from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import importRoutes from "./routes/import.routes.js";
import receiptRoutes from "./routes/receipt.routes.js";
import variantRoutes from "./routes/variant.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import positionRoutes from "./routes/position.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import leaveTypeRoutes from "./routes/leaveType.routes.js";
import leaveRequestRoutes from "./routes/leaveRequest.routes.js";
import resignationRequestRoutes from "./routes/resignationRequest.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import payrollPeriodRoutes from "./routes/payrollPeriod.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Auth routes (login, register, refresh, logout, sessions, đổi mật khẩu)
app.use("/api/v1/auth", authRoutes);

// User self-service routes (GET /users/me, PATCH /users/me)
app.use("/api/v1/users", userRouter);

// Admin user management routes (CRUD /admin/users)
app.use("/api/v1/admin/users", adminUserRouter);

app.use("/api/v1/product", productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/suppliers", supplierRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/imports", importRoutes);
app.use("/api/v1/receipts", receiptRoutes);
app.use("/api/v1/variants", variantRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/positions", positionRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/leave-types", leaveTypeRoutes);
app.use("/api/v1/leave-requests", leaveRequestRoutes);
app.use("/api/v1/resignation-requests", resignationRequestRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/payroll-periods", payrollPeriodRoutes);
app.use("/api/v1/payrolls", payrollRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
// Routes
app.get("/", (req, res) => {
  res.json({ message: "Coffee Shop API" });
});

// Error handler
// app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
