import jwt from "jsonwebtoken";
import { getUserById } from "../models/UserModel.js";

export async function authenticate(req, res, next) {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Token không hợp lệ");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra user có tồn tại và đang active
    const user = await getUserById(decoded.userId);
    if (!user || !user.isActive) {
      throw new Error("User không tồn tại hoặc đã bị vô hiệu hóa");
    }

    // Gắn thông tin user vào request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      error: "Không có quyền truy cập",
      message: error.message,
    });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.roleId)) {
      return res.status(403).json({
        error: "Không có quyền thực hiện hành động này",
      });
    }
    next();
  };
}

/**
 * Is Admin middleware
 */
export function isAdmin(req, res, next) {
  if (req.user.roleId !== 1) {
    return res.status(403).json({
      error: "Chỉ admin mới có quyền truy cập",
    });
  }
  next();
}
