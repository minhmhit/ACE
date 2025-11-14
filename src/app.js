import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/user.routes.js";
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

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/auth", authRoutes);
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
