import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Coffee Shop API" });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
