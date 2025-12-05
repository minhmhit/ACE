import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as UserModel from "../models/UserModel.js";

/**
 * Service xử lý đăng ký user mới
 */
export async function register(userData) {
  // Kiểm tra email tồn tại
  const existingUser = await UserModel.getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("Email đã được sử dụng");
  }

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Tạo user mới (mặc định roleId = 2 là regular user)

  const userId = await UserModel.createUser({
    ...userData,
    password: hashedPassword,
    roleId: userData.roleId || 2,
  });

  // Lấy thông tin user mới tạo (không bao gồm password)
  const newUser = await UserModel.getUserById(userId);
  return newUser;
}

/**
 * Service xử lý đăng nhập
 */
export async function login(email, password) {
  // Kiểm tra user tồn tại
  const user = await UserModel.getUserByEmail(email);
  if (!user) {
    throw new Error("Email không tồn tại");
  }

  // Kiểm tra user có bị vô hiệu hóa
  if (!user.isActive) {
    throw new Error("Tài khoản đã bị vô hiệu hóa");
  }

  // Kiểm tra mật khẩu
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error("Mật khẩu không chính xác");
  }

  // Tạo JWT token
  const token = jwt.sign(
    { userId: user.id, roleId: user.roleId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  // Loại bỏ password trước khi trả về
  delete user.password;
  return { user, token };
}

/**
 * Service lấy thông tin cá nhân
 */
export async function getUserById(userId) {
  const user = await UserModel.getUserById(userId);
  if (!user) {
    throw new Error("Không tìm thấy user");
  }
  delete user.password;
  return user;
}

/**
 * Service cập nhật thông tin cá nhân
 */
export async function updateProfile(userId, updateData) {
  // Kiểm tra user tồn tại
  const user = await UserModel.getUserById(userId);
  if (!user) {
    throw new Error("Không tìm thấy user");
  }

  // Không cho phép cập nhật email và role qua API này
  delete updateData.email;
  delete updateData.roleId;
  delete updateData.password;

  // Cập nhật thông tin
  await UserModel.updateUser(userId, updateData);

  // Lấy thông tin user sau khi cập nhật
  const updatedUser = await UserModel.getUserById(userId);
  return updatedUser;
}

/**
 * Service đổi mật khẩu
 */
export async function changePassword(
  userId,
  userEmail,
  { currentPassword, newPassword }
) {
  // Kiểm tra user tồn tại
  const user = await UserModel.getUserByEmail(userEmail);
  if (!user) {
    throw new Error("Không tìm thấy user");
  }

  // Kiểm tra mật khẩu hiện tại
  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    throw new Error("Mật khẩu hiện tại không chính xác");
  }

  // Mã hóa mật khẩu mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Cập nhật mật khẩu
  await UserModel.updatePassword(userId, hashedPassword);
  return user;
}

/**
 * Service lấy danh sách users (admin only)
 */
export async function getAllUsers(page, limit) {
  return UserModel.getAllUsers(page, limit);
}

/**
 * Service cập nhật trạng thái active của user (admin only)
 */
export async function updateUserStatus(userId, isActive) {
  // Kiểm tra user tồn tại
  const user = await UserModel.getUserById(userId);
  if (!user) {
    throw new Error("Không tìm thấy user");
  }

  // Không cho phép vô hiệu hóa tài khoản admin
  if (user.roleId === 1) {
    throw new Error("Không thể vô hiệu hóa tài khoản admin");
  }

  // Cập nhật trạng thái
  await UserModel.updateUser(userId, { isActive });
  return true;
}
