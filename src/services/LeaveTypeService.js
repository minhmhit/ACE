import * as LeaveTypeModel from "../models/LeaveTypeModel.js";

// ============================================
// Format response (snake_case → camelCase)
// ============================================
function formatLeaveType(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    isPaid: !!row.is_paid,
    requiresAttachment: !!row.requires_attachment,
    maxDaysPerYear: row.max_days_per_year,
    isActive: !!row.is_active,
  };
}

/**
 * Lấy danh sách leave types
 */
export async function getAll(query) {
  const isActive =
    query.isActive !== undefined
      ? query.isActive === "true" || query.isActive === "1"
      : null;

  const rows = await LeaveTypeModel.getAll({ isActive });
  return rows.map(formatLeaveType);
}

/**
 * Lấy leave type theo id
 */
export async function getById(id) {
  const row = await LeaveTypeModel.getById(id);
  if (!row) {
    const error = new Error("Không tìm thấy loại nghỉ phép");
    error.statusCode = 404;
    throw error;
  }
  return formatLeaveType(row);
}

/**
 * Tạo leave type mới
 */
export async function create(data) {
  const exists = await LeaveTypeModel.isCodeExists(data.code);
  if (exists) {
    const error = new Error("Mã loại nghỉ phép đã tồn tại");
    error.statusCode = 409;
    throw error;
  }

  const id = await LeaveTypeModel.create(data);
  return getById(id);
}

/**
 * Cập nhật leave type
 */
export async function update(id, data) {
  const existing = await LeaveTypeModel.getById(id);
  if (!existing) {
    const error = new Error("Không tìm thấy loại nghỉ phép");
    error.statusCode = 404;
    throw error;
  }

  if (data.code && data.code !== existing.code) {
    const exists = await LeaveTypeModel.isCodeExists(data.code, id);
    if (exists) {
      const error = new Error("Mã loại nghỉ phép đã tồn tại");
      error.statusCode = 409;
      throw error;
    }
  }

  await LeaveTypeModel.update(id, data);
  return getById(id);
}
