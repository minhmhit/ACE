import bcrypt from "bcryptjs";
import * as UserModel from "../models/UserModel.js";
import * as RoleModel from "../models/RoleModel.js";

// ============================================
// SELF-SERVICE (User tự quản lý profile)
// ============================================

/**
 * Lấy profile của user hiện tại kèm role info
 */
export async function getMe(userId) {
  const user = await UserModel.getUserById(userId);
  if (!user) {
    const error = new Error("Không tìm thấy user");
    error.statusCode = 404;
    throw error;
  }

  const role = await RoleModel.getRoleById(user.roleId);
  return {
    ...user,
    role: role ? { id: role.id, code: role.code, name: role.name } : null,
  };
}

/**
 * User tự cập nhật profile
 * Chỉ cho phép: name, phoneNumber, username, avatarUrl
 */
export async function updateMe(userId, updateData) {
  const user = await UserModel.getUserById(userId);
  if (!user) {
    const error = new Error("Không tìm thấy user");
    error.statusCode = 404;
    throw error;
  }

  // Chỉ cho phép user tự sửa các field này
  const allowedFields = ["name", "phoneNumber", "username", "avatarUrl"];
  const filteredData = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  if (Object.keys(filteredData).length === 0) {
    const error = new Error("Không có dữ liệu cần cập nhật");
    error.statusCode = 400;
    throw error;
  }

  // Validate username unique nếu thay đổi
  if (filteredData.username && filteredData.username !== user.username) {
    const exists = await UserModel.isUsernameExists(
      filteredData.username,
      userId,
    );
    if (exists) {
      const error = new Error("Username đã tồn tại");
      error.statusCode = 409;
      throw error;
    }
  }

  await UserModel.updateUser(userId, filteredData);
  return await getMe(userId);
}

// ============================================
// ADMIN - Quản lý users
// ============================================

/**
 * Admin lấy danh sách users với search/filter/phân trang
 * Query params: page, limit, search, roleId, isActive, includeDeleted
 */
export async function adminGetUsers(query) {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);

  return UserModel.getAllUsersAdmin({
    page,
    limit,
    search: query.search || null,
    roleId: query.roleId ? parseInt(query.roleId) : null,
    isActive:
      query.isActive !== undefined
        ? query.isActive === "true" || query.isActive === "1"
        : null,
    includeDeleted:
      query.includeDeleted === "true" || query.includeDeleted === "1",
  });
}

/**
 * Admin xem chi tiết user (bao gồm cả soft deleted)
 */
export async function adminGetUserById(userId) {
  const user = await UserModel.getUserByIdAdmin(userId);
  if (!user) {
    const error = new Error("Không tìm thấy user");
    error.statusCode = 404;
    throw error;
  }
  return user;
}

/**
 * Admin tạo user mới
 * Admin có thể set: name, email, username, password, roleId, phoneNumber, avatarUrl
 */
export async function adminCreateUser(data) {
  // Check email unique
  const emailExists = await UserModel.isEmailExists(data.email);
  if (emailExists) {
    const error = new Error("Email đã được sử dụng");
    error.statusCode = 409;
    throw error;
  }

  // Check username unique
  if (data.username) {
    const usernameExists = await UserModel.isUsernameExists(data.username);
    if (usernameExists) {
      const error = new Error("Username đã tồn tại");
      error.statusCode = 409;
      throw error;
    }
  }

  // Validate role
  if (data.roleId) {
    const role = await RoleModel.getRoleById(data.roleId);
    if (!role || !role.isActive) {
      const error = new Error("Role không hợp lệ hoặc đã bị vô hiệu hóa");
      error.statusCode = 400;
      throw error;
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const userId = await UserModel.createUser({
    name: data.name,
    email: data.email,
    username: data.username,
    password: hashedPassword,
    roleId: data.roleId || 2,
    phoneNumber: data.phoneNumber,
    avatarUrl: data.avatarUrl,
  });

  return UserModel.getUserByIdAdmin(userId);
}

/**
 * Admin cập nhật user
 * Admin có thể sửa: name, email, username, phoneNumber, avatarUrl, roleId, isActive, password
 */
export async function adminUpdateUser(userId, data) {
  const user = await UserModel.getUserByIdAdmin(userId);
  if (!user) {
    const error = new Error("Không tìm thấy user");
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    "name",
    "email",
    "username",
    "phoneNumber",
    "avatarUrl",
    "roleId",
    "isActive",
  ];
  const filteredData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  }

  // Check email unique
  if (filteredData.email && filteredData.email !== user.email) {
    const exists = await UserModel.isEmailExists(filteredData.email, userId);
    if (exists) {
      const error = new Error("Email đã được sử dụng");
      error.statusCode = 409;
      throw error;
    }
  }

  // Check username unique
  if (filteredData.username && filteredData.username !== user.username) {
    const exists = await UserModel.isUsernameExists(
      filteredData.username,
      userId,
    );
    if (exists) {
      const error = new Error("Username đã tồn tại");
      error.statusCode = 409;
      throw error;
    }
  }

  // Validate role
  if (filteredData.roleId && filteredData.roleId !== user.roleId) {
    const role = await RoleModel.getRoleById(filteredData.roleId);
    if (!role || !role.isActive) {
      const error = new Error("Role không hợp lệ hoặc đã bị vô hiệu hóa");
      error.statusCode = 400;
      throw error;
    }
  }

  // Reset password nếu admin muốn đổi
  if (data.password) {
    filteredData.password = await bcrypt.hash(data.password, 10);
  }

  if (Object.keys(filteredData).length === 0) {
    const error = new Error("Không có dữ liệu cần cập nhật");
    error.statusCode = 400;
    throw error;
  }

  await UserModel.updateUser(userId, filteredData);
  return UserModel.getUserByIdAdmin(userId);
}

/**
 * Admin soft delete user
 * Set deletedAt = NOW(), isActive = 0
 * Không cho xóa admin
 */
export async function adminDeleteUser(userId) {
  const user = await UserModel.getUserByIdAdmin(userId);
  if (!user) {
    const error = new Error("Không tìm thấy user");
    error.statusCode = 404;
    throw error;
  }

  if (user.roleCode === "ADMIN") {
    const error = new Error("Không thể xóa tài khoản admin");
    error.statusCode = 403;
    throw error;
  }

  if (user.deletedAt) {
    const error = new Error("User đã bị xóa trước đó");
    error.statusCode = 400;
    throw error;
  }

  await UserModel.softDeleteUser(userId);
  return { message: "Xóa user thành công" };
}

/**
 * Admin toggle active/inactive
 * Không cho thay đổi trạng thái admin
 */
export async function adminToggleActive(userId, isActive) {
  const user = await UserModel.getUserByIdAdmin(userId);
  if (!user) {
    const error = new Error("Không tìm thấy user");
    error.statusCode = 404;
    throw error;
  }

  if (user.roleCode === "ADMIN") {
    const error = new Error("Không thể thay đổi trạng thái tài khoản admin");
    error.statusCode = 403;
    throw error;
  }

  await UserModel.toggleActive(userId, isActive);
  return UserModel.getUserByIdAdmin(userId);
}
