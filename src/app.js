import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/", authRoutes);
app.use("/api/v1/", productRoutes);

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
