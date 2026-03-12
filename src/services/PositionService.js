import * as PositionModel from "../models/PositionModel.js";

/**
 * Hàm format response position (snake_case → camelCase)
 */
function formatPosition(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    levelNo: row.level_no,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Lấy danh sách positions
 */
export async function getAll(query) {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);

  const result = await PositionModel.getAll({
    page,
    limit,
    search: query.search || null,
    isActive:
      query.isActive !== undefined
        ? query.isActive === "true" || query.isActive === "1"
        : null,
  });

  return {
    positions: result.positions.map(formatPosition),
    pagination: result.pagination,
  };
}

/**
 * Lấy position theo id
 */
export async function getById(id) {
  const pos = await PositionModel.getById(id);
  if (!pos) {
    const error = new Error("Không tìm thấy chức vụ");
    error.statusCode = 404;
    throw error;
  }
  return formatPosition(pos);
}

/**
 * Tạo position mới
 */
export async function create(data) {
  const exists = await PositionModel.isCodeExists(data.code);
  if (exists) {
    const error = new Error("Mã chức vụ đã tồn tại");
    error.statusCode = 409;
    throw error;
  }

  const id = await PositionModel.create({
    code: data.code,
    name: data.name,
    description: data.description,
    levelNo: data.levelNo,
  });

  return await getById(id);
}

/**
 * Cập nhật position
 */
export async function update(id, data) {
  const pos = await PositionModel.getById(id);
  if (!pos) {
    const error = new Error("Không tìm thấy chức vụ");
    error.statusCode = 404;
    throw error;
  }

  if (data.code && data.code !== pos.code) {
    const exists = await PositionModel.isCodeExists(data.code, id);
    if (exists) {
      const error = new Error("Mã chức vụ đã tồn tại");
      error.statusCode = 409;
      throw error;
    }
  }

  await PositionModel.update(id, data);
  return await getById(id);
}

/**
 * Toggle active/inactive
 */
export async function toggleActive(id, isActive) {
  const pos = await PositionModel.getById(id);
  if (!pos) {
    const error = new Error("Không tìm thấy chức vụ");
    error.statusCode = 404;
    throw error;
  }

  // Nếu vô hiệu hóa, kiểm tra có nhân viên đang giữ chức vụ này
  if (!isActive) {
    const count = await PositionModel.countActiveEmployees(id);
    if (count > 0) {
      const error = new Error(
        `Không thể vô hiệu hóa: còn ${count} nhân viên đang giữ chức vụ này`,
      );
      error.statusCode = 400;
      throw error;
    }
  }

  await PositionModel.update(id, { isActive });
  return await getById(id);
}
