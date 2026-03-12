import jwt from "jsonwebtoken";
import { getUserById } from "../models/UserModel.js";
import { getRoleById } from "../models/RoleModel.js";
import { getSessionByJti } from "../models/SessionModel.js";

/**
 * Middleware xác thực user với JWT + Session validation
 */
export async function authenticate(req, res, next) {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Token không hợp lệ");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token type
    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }

    // Check session not revoked/blacklisted
    const session = await getSessionByJti(decoded.jti);
    if (!session) {
      throw new Error("Session đã bị revoke hoặc expired");
    }

    // Kiểm tra user có tồn tại và đang active
    const user = await getUserById(decoded.userId);
    if (!user || !user.isActive) {
      throw new Error("User không tồn tại hoặc đã bị vô hiệu hóa");
    }

    // Lấy thông tin role
    const role = await getRoleById(user.roleId);
    if (!role || !role.isActive) {
      throw new Error("Role không hợp lệ hoặc đã bị vô hiệu hóa");
    }

    // Gắn thông tin user + role vào request
    req.user = {
      ...user,
      role: {
        id: role.id,
        code: role.code,
        name: role.name,
        description: role.description,
      },
      jti: decoded.jti, // Lưu JWT ID để dùng cho logout
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Không có quyền truy cập",
      message: error.message,
    });
  }
}

/**
 * Middleware phân quyền theo role code
 * @param {...string} roleCodes - Danh sách role codes được phép (ADMIN, USER, HRM, etc.)
 */
export function authorize(...roleCodes) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        error: "Không có quyền thực hiện hành động này",
        message: "User hoặc role không tồn tại",
      });
    }

    if (!roleCodes.includes(req.user.role.code)) {
      return res.status(403).json({
        success: false,
        error: "Không có quyền thực hiện hành động này",
        requiredRoles: roleCodes,
        yourRole: req.user.role.code,
      });
    }
    next();
  };
}

/**
 * Middleware kiểm tra là Admin
 */
export function isAdmin(req, res, next) {
  if (!req.user || !req.user.role || req.user.role.code !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: "Chỉ admin mới có quyền truy cập",
    });
  }
  next();
}
