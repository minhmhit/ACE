import { apiClient } from "@/lib/api/axios"
import type { ApiSuccessResponse } from "@/types/api/api.types"
import type { Department } from "@/types/domain/hr.types"

export const departmentsService = {
  async getList() {
    const response = await apiClient.get<ApiSuccessResponse<Department[]>>("/departments")
    return response.data.data
  },

  async getDetail(departmentId: number) {
    const response = await apiClient.get<ApiSuccessResponse<Department>>(
      `/departments/${departmentId}`,
    )
    return response.data.data
  },
}
