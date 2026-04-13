import { pool } from "../config/db.js";
import * as UserModel from "../models/UserModel.js";

function formatAddress(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    receiverName: row.receiver_name,
    phoneNumber: row.phone_number,
    fullAddress: row.full_address,
    isDefault: !!row.is_default,
    addressType: row.address_type,
    createdAt: row.created_at,
    updatedAt: row.update_at,
  };
}

export async function getMyAddresses(userId) {
  const rows = await UserModel.getAddressesByUserId(userId);
  return rows.map(formatAddress);
}

export async function getDefaultAddress(userId) {
  const row = await UserModel.getDefaultAddressByUserId(userId);
  return formatAddress(row);
}

export async function createAddress(userId, data) {
  const addressCount = await UserModel.countAddressesByUserId(userId);
  const mustBeDefault = addressCount === 0;
  const nextIsDefault = mustBeDefault || data.isDefault === true;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (nextIsDefault) {
      await UserModel.clearDefaultAddresses(conn, userId);
    }

    const created = await UserModel.createAddress(conn, {
      userId,
      receiverName: data.receiverName,
      phoneNumber: data.phoneNumber,
      fullAddress: data.fullAddress,
      addressType: data.addressType || "home",
      isDefault: nextIsDefault,
    });

    await conn.commit();
    return formatAddress(created);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function updateAddress(userId, addressId, data) {
  const current = await UserModel.getAddressByIdAndUserId(addressId, userId);
  if (!current) {
    const error = new Error("Không tìm thấy địa chỉ");
    error.statusCode = 404;
    throw error;
  }

  const nextIsDefault = data.isDefault === true || !!current.is_default;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (data.isDefault === true) {
      await UserModel.clearDefaultAddresses(conn, userId);
    }

    const updated = await UserModel.updateAddress(conn, addressId, userId, {
      receiverName: data.receiverName ?? current.receiver_name,
      phoneNumber: data.phoneNumber ?? current.phone_number,
      fullAddress: data.fullAddress ?? current.full_address,
      addressType: data.addressType ?? current.address_type,
      isDefault: nextIsDefault,
    });

    await conn.commit();
    return formatAddress(updated);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function deleteAddress(userId, addressId) {
  const current = await UserModel.getAddressByIdAndUserId(addressId, userId);
  if (!current) {
    const error = new Error("Không tìm thấy địa chỉ");
    error.statusCode = 404;
    throw error;
  }

  if (current.is_default) {
    const error = new Error(
      "Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước",
    );
    error.statusCode = 400;
    throw error;
  }

  await UserModel.deleteAddress(addressId, userId);
  return { message: "Xóa địa chỉ thành công" };
}
