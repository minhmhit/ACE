import * as DepartmentModel from "../models/DepartmentModel.js";

/**
 * Hàm format response department (snake_case → camelCase)
 */
function formatDepartment(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    managerEmployeeId: row.manager_employee_id,
    managerCode: row.managerCode || null,
    managerName: row.managerName || null,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Lấy danh sách departments
 */
export async function getAll(query) {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);

  const result = await DepartmentModel.getAll({
    page,
    limit,
    search: query.search || null,
    isActive:
      query.isActive !== undefined
        ? query.isActive === "true" || query.isActive === "1"
        : null,
  });

  return {
    departments: result.departments.map(formatDepartment),
    pagination: result.pagination,
  };
}

/**
 * Lấy department theo id
 */
export async function getById(id) {
  const dept = await DepartmentModel.getById(id);
  if (!dept) {
    const error = new Error("Không tìm thấy phòng ban");
    error.statusCode = 404;
    throw error;
  }
  return formatDepartment(dept);
}

/**
 * Tạo department mới
 */
export async function create(data) {
  // Check code unique
  const exists = await DepartmentModel.isCodeExists(data.code);
  if (exists) {
    const error = new Error("Mã phòng ban đã tồn tại");
    error.statusCode = 409;
    throw error;
  }

  const id = await DepartmentModel.create({
    code: data.code,
    name: data.name,
    description: data.description,
    managerEmployeeId: data.managerEmployeeId,
  });

  return await getById(id);
}

/**
 * Cập nhật department
 */
export async function update(id, data) {
  const dept = await DepartmentModel.getById(id);
  if (!dept) {
    const error = new Error("Không tìm thấy phòng ban");
    error.statusCode = 404;
    throw error;
  }

  // Check code unique nếu thay đổi
  if (data.code && data.code !== dept.code) {
    const exists = await DepartmentModel.isCodeExists(data.code, id);
    if (exists) {
      const error = new Error("Mã phòng ban đã tồn tại");
      error.statusCode = 409;
      throw error;
    }
  }

  await DepartmentModel.update(id, data);
  return await getById(id);
}

/**
 * Toggle active/inactive
 */
export async function toggleActive(id, isActive) {
  const dept = await DepartmentModel.getById(id);
  if (!dept) {
    const error = new Error("Không tìm thấy phòng ban");
    error.statusCode = 404;
    throw error;
  }

  // Nếu vô hiệu hóa, kiểm tra có nhân viên đang thuộc phòng ban không
  if (!isActive) {
    const count = await DepartmentModel.countEmployees(id);
    if (count > 0) {
      const error = new Error(
        `Không thể vô hiệu hóa: phòng ban còn ${count} nhân viên đang hoạt động`,
      );
      error.statusCode = 400;
      throw error;
    }
  }

  await DepartmentModel.update(id, { isActive });
  return await getById(id);
}
