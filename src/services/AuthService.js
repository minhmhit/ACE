import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/db.js";
import * as UserModel from "../models/UserModel.js";
import * as RoleModel from "../models/RoleModel.js";
import * as SessionModel from "../models/SessionModel.js";

/**
 * Generate access token và refresh token
 * @param {Object} user - User object
 * @param {string} jwtId - Unique JWT ID
 * @returns {Object} - { accessToken, refreshToken }
 */
function generateTokens(user, jwtId) {
  // Access token (short-lived: 15 phút)
  const accessToken = jwt.sign(
    {
      userId: user.id,
      roleId: user.roleId,
      username: user.username,
      jti: jwtId,
      type: "access",
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "15m" },
  );

  // Refresh token (long-lived: 30 ngày)
  const refreshToken = jwt.sign(
    {
      userId: user.id,
      jti: jwtId,
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "30d" },
  );

  return { accessToken, refreshToken };
}

/**
 * Service login với session management
 * @param {string} email - Email hoặc username
 * @param {string} password - Password
 * @param {Object} deviceInfo - Thông tin thiết bị
 * @returns {Object} - User, tokens
 */
export async function login(email, password, deviceInfo) {
  // Tìm user theo email hoặc username
  let user = await UserModel.getUserByEmail(email);
  if (!user) {
    user = await UserModel.getUserByUsername(email);
  }

  if (!user) {
    throw new Error("Email hoặc username không tồn tại");
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

  // Lấy thông tin role
  const role = await RoleModel.getRoleById(user.roleId);
  if (!role || !role.isActive) {
    throw new Error("Role không hợp lệ hoặc đã bị vô hiệu hóa");
  }

  // Update lastLoginAt
  await UserModel.updateLastLogin(user.id);

  // Generate tokens
  const jwtId = uuidv4();
  const { accessToken, refreshToken } = generateTokens(user, jwtId);

  // Save session
  await SessionModel.createSession({
    userId: user.id,
    refreshToken,
    jwtId,
    deviceId: deviceInfo.deviceId || uuidv4(),
    deviceName: deviceInfo.deviceName || "Unknown Device",
    ipAddress: deviceInfo.ipAddress || "127.0.0.1",
    userAgent: deviceInfo.userAgent || "Unknown",
    expiresInDays: 30,
  });

  // Loại bỏ password trước khi trả về
  delete user.password;

  return {
    user: {
      ...user,
      role: {
        id: role.id,
        code: role.code,
        name: role.name,
      },
    },
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRE || "15m",
  };
}

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @param {Object} deviceInfo - Thông tin thiết bị
 * @returns {Object} - New tokens
 */
export async function refreshAccessToken(refreshToken, deviceInfo) {
  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    );
  } catch (error) {
    throw new Error("Refresh token không hợp lệ hoặc đã hết hạn");
  }

  if (decoded.type !== "refresh") {
    throw new Error("Invalid token type");
  }

  // Verify session exists and not revoked
  const session = await SessionModel.verifyRefreshToken(
    decoded.jti,
    refreshToken,
  );
  if (!session) {
    throw new Error("Session không hợp lệ, đã expired hoặc bị revoke");
  }

  // Get user
  const user = await UserModel.getUserById(decoded.userId);
  if (!user || !user.isActive) {
    throw new Error("User không tồn tại hoặc đã bị vô hiệu hóa");
  }

  // Get role
  const role = await RoleModel.getRoleById(user.roleId);
  if (!role || !role.isActive) {
    throw new Error("Role không hợp lệ");
  }

  // Generate new tokens với JWT ID mới
  const newJwtId = uuidv4();
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user,
    newJwtId,
  );

  // Rotate refresh token (revoke old, create new)
  await SessionModel.rotateRefreshToken(session.id, {
    userId: user.id,
    refreshToken: newRefreshToken,
    jwtId: newJwtId,
    deviceId: session.device_id,
    deviceName: session.device_name,
    ipAddress: deviceInfo.ipAddress || session.ip_address,
    userAgent: deviceInfo.userAgent || session.user_agent,
    expiresInDays: 30,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn: process.env.JWT_EXPIRE || "15m",
  };
}

/**
 * Logout (revoke session)
 * @param {string} jwtId - JWT ID từ access token
 * @returns {Object} - Success message
 */
export async function logout(jwtId) {
  await SessionModel.revokeSessionByJti(jwtId, "User logout");
  return { message: "Đăng xuất thành công" };
}

/**
 * Logout all devices
 * @param {number} userId - User ID
 * @param {string|null} currentJti - JWT ID hiện tại (được giữ lại)
 * @returns {Object} - Success message
 */
export async function logoutAllDevices(userId, currentJti = null) {
  let exceptSessionId = null;

  // Nếu có currentJti, tìm session ID để không revoke
  if (currentJti) {
    const currentSession = await SessionModel.getSessionByJti(currentJti);
    exceptSessionId = currentSession?.id;
  }

  await SessionModel.revokeAllUserSessions(userId, exceptSessionId);
  return {
    message: currentJti
      ? "Đã đăng xuất khỏi tất cả thiết bị khác"
      : "Đã đăng xuất khỏi tất cả thiết bị",
  };
}

/**
 * Get user profile với role info
 * @param {number} userId - User ID
 * @returns {Object} - User profile
 */
export async function getProfile(userId) {
  const user = await UserModel.getUserById(userId);
  if (!user) {
    throw new Error("Không tìm thấy user");
  }

  const role = await RoleModel.getRoleById(user.roleId);
  const defaultAddress = await UserModel.getDefaultAddressByUserId(userId);

  return {
    ...user,
    address: defaultAddress?.full_address || null,
    defaultAddress: defaultAddress || null,
    role: {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
    },
  };
}

/**
 * Update user profile
 * @param {number} userId - User ID
 * @param {Object} updateData - Dữ liệu cần update
 * @returns {Object} - Updated user
 */
export async function updateProfile(userId, updateData) {
  // Kiểm tra user tồn tại
  const user = await UserModel.getUserById(userId);
  if (!user) {
    throw new Error("Không tìm thấy user");
  }

  // Chỉ cho phép update một số fields
  const allowedFields = ["name", "phoneNumber", "username", "avatarUrl"];
  const filteredData = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  // Validate username unique nếu có thay đổi
  if (filteredData.username && filteredData.username !== user.username) {
    const isExists = await UserModel.isUsernameExists(
      filteredData.username,
      userId,
    );
    if (isExists) {
      throw new Error("Username đã tồn tại");
    }
  }

  const nextFullAddress = updateData.fullAddress || updateData.address;
  const hasAddressUpdate = nextFullAddress !== undefined;

  if (!hasAddressUpdate && Object.keys(filteredData).length === 0) {
    throw new Error("Không có dữ liệu cần cập nhật");
  }

  if (Object.keys(filteredData).length > 0) {
    await UserModel.updateUser(userId, filteredData);
  }

  if (hasAddressUpdate) {
    const nextPhone =
      updateData.phoneNumber !== undefined
        ? updateData.phoneNumber
        : user.phoneNumber;
    const nextReceiver =
      updateData.receiverName || updateData.name || user.name;

    if (!nextPhone) {
      throw new Error("Cần phoneNumber để cập nhật địa chỉ mặc định cho hồ sơ");
    }

    const currentDefaultAddress =
      await UserModel.getDefaultAddressByUserId(userId);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (!currentDefaultAddress) {
        await UserModel.createAddress(conn, {
          userId,
          receiverName: nextReceiver,
          phoneNumber: nextPhone,
          fullAddress: nextFullAddress,
          addressType: updateData.addressType || "home",
          isDefault: true,
        });
      } else {
        await UserModel.updateAddress(conn, currentDefaultAddress.id, userId, {
          receiverName: nextReceiver,
          phoneNumber: nextPhone,
          fullAddress: nextFullAddress,
          addressType:
            updateData.addressType || currentDefaultAddress.address_type,
          isDefault: true,
        });
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Lấy thông tin user sau khi update
  return await getProfile(userId);
}

/**
 * Change password
 * @param {number} userId - User ID
 * @param {string} currentPassword - Mật khẩu hiện tại
 * @param {string} newPassword - Mật khẩu mới
 * @returns {Object} - Success message
 */
export async function changePassword(userId, currentPassword, newPassword) {
  // Lấy user với password
  const user = await UserModel.getUserByEmail(
    (await UserModel.getUserById(userId)).email,
  );

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

  return { message: "Đổi mật khẩu thành công" };
}

/**
 * Get user sessions
 * @param {number} userId - User ID
 * @returns {Array} - Danh sách sessions
 */
export async function getUserSessions(userId) {
  const sessions = await SessionModel.getUserSessions(userId);

  // Format response
  return sessions.map((s) => ({
    sessionId: s.id,
    deviceName: s.device_name,
    deviceId: s.device_id,
    ipAddress: s.ip_address,
    lastUsedAt: s.last_used_at,
    issuedAt: s.issued_at,
    expiresAt: s.expires_at,
    jwtId: s.jwt_id,
  }));
}

/**
 * Revoke specific session
 * @param {number} userId - User ID
 * @param {number} sessionId - Session ID cần revoke
 * @returns {Object} - Success message
 */
export async function revokeSession(userId, sessionId) {
  const session = await SessionModel.getSessionById(sessionId);

  if (!session) {
    throw new Error("Session không tồn tại");
  }

  if (session.user_id !== userId) {
    throw new Error("Session không thuộc về bạn");
  }

  await SessionModel.revokeSession(sessionId, "Revoked by user");
  return { message: "Đã logout thiết bị thành công" };
}

/**
 * Register new user
 * @param {Object} userData - User data
 * @returns {Object} - New user
 */
export async function register(userData) {
  const registerAddress = userData.fullAddress || userData.address;
  if (registerAddress && !userData.phoneNumber) {
    throw new Error("Cần phoneNumber khi tạo địa chỉ mặc định lúc đăng ký");
  }

  // Kiểm tra email tồn tại
  const existingUser = await UserModel.getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("Email đã được sử dụng");
  }

  // Kiểm tra username tồn tại (nếu có)
  if (userData.username) {
    const isExists = await UserModel.isUsernameExists(userData.username);
    if (isExists) {
      throw new Error("Username đã tồn tại");
    }
  }

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Tạo user mới (mặc định roleId = 2 là regular user)
  const userId = await UserModel.createUser({
    ...userData,
    password: hashedPassword,
    roleId: userData.roleId || 2, // Default: USER role
  });

  // Nếu có địa chỉ lúc đăng ký thì tạo luôn địa chỉ mặc định đầu tiên
  if (registerAddress) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await UserModel.createAddress(conn, {
        userId,
        receiverName: userData.receiverName || userData.name,
        phoneNumber: userData.phoneNumber,
        fullAddress: registerAddress,
        addressType: userData.addressType || "home",
        isDefault: true,
      });
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Lấy thông tin user mới tạo
  const newUser = await getProfile(userId);
  return newUser;
}

/**
 * Reset password bằng username
 * Mật khẩu mới = {SĐT}@123456
 * @param {string} username - Username hoặc email
 * @returns {Object} - Thông báo mật khẩu mới (đã mask SĐT)
 */
export async function resetPasswordByUsername(username) {
  // Tìm user theo username hoặc email
  let user = await UserModel.getUserByUsername(username);
  if (!user) {
    user = await UserModel.getUserByEmail(username);
  }

  if (!user) {
    throw new Error("Không tìm thấy tài khoản với username này");
  }

  if (!user.isActive) {
    throw new Error("Tài khoản đã bị vô hiệu hóa");
  }

  // Lấy SĐT
  const phone = user.phoneNumber;
  if (!phone) {
    throw new Error(
      "Tài khoản chưa đăng ký số điện thoại, không thể đặt lại mật khẩu. Vui lòng liên hệ quản trị viên."
    );
  }

  // Tạo mật khẩu mới: Sdt@123456
  const newPassword = `${phone}@123456`;
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Cập nhật mật khẩu
  await UserModel.updatePassword(user.id, hashedPassword);

  // Revoke tất cả sessions để buộc đăng nhập lại
  await SessionModel.revokeAllUserSessions(user.id);

  // Mask SĐT để hiển thị cho user (chỉ hiện 3 số cuối)
  const maskedPhone = phone.replace(/.(?=.{3})/g, "*");

  return {
    message: `Mật khẩu đã được đặt lại thành công`,
    hint: `Mật khẩu mới: ${maskedPhone}@123456`,
  };
}
