import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

/**
 * Tạo session mới khi login
 * @param {Object} sessionData - Thông tin session
 * @returns {number} - Session ID
 */
export async function createSession(sessionData) {
  const {
    userId,
    refreshToken,
    jwtId,
    deviceId,
    deviceName,
    ipAddress,
    userAgent,
    expiresInDays = 30,
  } = sessionData;

  // Hash refresh token trước khi lưu (bảo mật)
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const [result] = await pool.query(
    `INSERT INTO sessions 
     (user_id, refresh_token_hash, jwt_id, device_id, device_name, 
      ip_address, user_agent, expires_at, last_used_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      userId,
      refreshTokenHash,
      jwtId,
      deviceId,
      deviceName,
      ipAddress,
      userAgent,
      expiresAt,
    ],
  );

  return result.insertId;
}

/**
 * Lấy session theo JWT ID (jti)
 * @param {string} jwtId - JWT ID từ token payload
 * @returns {Object|null} - Session object hoặc null
 */
export async function getSessionByJti(jwtId) {
  const [rows] = await pool.query(
    `SELECT * FROM sessions 
     WHERE jwt_id = ? 
       AND is_blacklisted = 0 
       AND revoked_at IS NULL
       AND expires_at > NOW()`,
    [jwtId],
  );
  return rows[0];
}

/**
 * Verify refresh token với session
 * @param {string} jwtId - JWT ID
 * @param {string} refreshToken - Raw refresh token
 * @returns {Object|null} - Session nếu hợp lệ, null nếu không
 */
export async function verifyRefreshToken(jwtId, refreshToken) {
  const session = await getSessionByJti(jwtId);
  if (!session) {
    return null;
  }

  // Verify hash
  const isValid = await bcrypt.compare(
    refreshToken,
    session.refresh_token_hash,
  );
  if (!isValid) {
    return null;
  }

  // Update last_used_at
  await pool.query("UPDATE sessions SET last_used_at = NOW() WHERE id = ?", [
    session.id,
  ]);

  return session;
}

/**
 * Revoke session (logout)
 * @param {number} sessionId - Session ID
 * @param {string} reason - Lý do revoke
 */
export async function revokeSession(sessionId, reason = "User logout") {
  await pool.query(
    `UPDATE sessions 
     SET revoked_at = NOW(), revoke_reason = ? 
     WHERE id = ?`,
    [reason, sessionId],
  );
}

/**
 * Revoke session theo JWT ID
 * @param {string} jwtId - JWT ID
 * @param {string} reason - Lý do revoke
 */
export async function revokeSessionByJti(jwtId, reason = "User logout") {
  await pool.query(
    `UPDATE sessions 
     SET revoked_at = NOW(), revoke_reason = ? 
     WHERE jwt_id = ?`,
    [reason, jwtId],
  );
}

/**
 * Blacklist session (đưa vào danh sách đen)
 * @param {number} sessionId - Session ID
 */
export async function blacklistSession(sessionId) {
  await pool.query("UPDATE sessions SET is_blacklisted = 1 WHERE id = ?", [
    sessionId,
  ]);
}

/**
 * Rotate refresh token (sau khi dùng refresh token cũ)
 * @param {number} oldSessionId - Session ID cũ
 * @param {Object} newSessionData - Dữ liệu session mới
 * @returns {number} - Session ID mới
 */
export async function rotateRefreshToken(oldSessionId, newSessionData) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Revoke old session
    await conn.query(
      `UPDATE sessions 
       SET revoked_at = NOW(), revoke_reason = 'Token rotated' 
       WHERE id = ?`,
      [oldSessionId],
    );

    // Create new session
    const {
      userId,
      refreshToken,
      jwtId,
      deviceId,
      deviceName,
      ipAddress,
      userAgent,
      expiresInDays = 30,
    } = newSessionData;

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const [result] = await conn.query(
      `INSERT INTO sessions 
       (user_id, refresh_token_hash, jwt_id, device_id, device_name, 
        ip_address, user_agent, expires_at, last_used_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        refreshTokenHash,
        jwtId,
        deviceId,
        deviceName,
        ipAddress,
        userAgent,
        expiresAt,
      ],
    );

    const newSessionId = result.insertId;

    // Link old session to new
    await conn.query(
      "UPDATE sessions SET replaced_by_session_id = ? WHERE id = ?",
      [newSessionId, oldSessionId],
    );

    await conn.commit();
    return newSessionId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Logout all devices (revoke all sessions của user)
 * @param {number} userId - User ID
 * @param {number|null} exceptSessionId - Session ID được giữ lại (optional)
 */
export async function revokeAllUserSessions(userId, exceptSessionId = null) {
  const query = exceptSessionId
    ? `UPDATE sessions 
       SET revoked_at = NOW(), revoke_reason = 'Logout all devices' 
       WHERE user_id = ? AND id != ? AND revoked_at IS NULL`
    : `UPDATE sessions 
       SET revoked_at = NOW(), revoke_reason = 'Logout all devices' 
       WHERE user_id = ? AND revoked_at IS NULL`;

  const params = exceptSessionId ? [userId, exceptSessionId] : [userId];
  await pool.query(query, params);
}

/**
 * Lấy danh sách sessions của user
 * @param {number} userId - User ID
 * @param {boolean} includeRevoked - Có bao gồm sessions đã revoke không
 * @returns {Array} - Danh sách sessions
 */
export async function getUserSessions(userId, includeRevoked = false) {
  const query = includeRevoked
    ? "SELECT * FROM sessions WHERE user_id = ? ORDER BY last_used_at DESC"
    : `SELECT * FROM sessions 
       WHERE user_id = ? AND revoked_at IS NULL AND is_blacklisted = 0 
       ORDER BY last_used_at DESC`;

  const [rows] = await pool.query(query, [userId]);
  return rows;
}

/**
 * Cleanup expired sessions (chạy định kỳ - cron job)
 */
export async function cleanupExpiredSessions() {
  await pool.query(
    `UPDATE sessions 
     SET revoked_at = NOW(), revoke_reason = 'Expired' 
     WHERE expires_at < NOW() AND revoked_at IS NULL`,
  );
}

/**
 * Lấy session theo ID
 * @param {number} sessionId - Session ID
 * @returns {Object|null} - Session object hoặc null
 */
export async function getSessionById(sessionId) {
  const [rows] = await pool.query("SELECT * FROM sessions WHERE id = ?", [
    sessionId,
  ]);
  return rows[0];
}
