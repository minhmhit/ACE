import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// __dirname cho ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const ABSOLUTE_UPLOAD_PATH = process.env.ABSOLUTE_UPLOAD_PATH || `D:/study/HK5/ooad_prj/frontend/asset/img/products`;


// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(ABSOLUTE_UPLOAD_PATH)) {
  fs.mkdirSync(ABSOLUTE_UPLOAD_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, ABSOLUTE_UPLOAD_PATH);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + ext;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// API upload file
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  return res.json({
    message: "Upload thành công",
    fileName: req.file.filename,
    absolutePath: path.join(ABSOLUTE_UPLOAD_PATH, req.file.filename),
  });
});

export default router;
