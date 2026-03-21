import { apiClient } from "@/lib/api/axios"
import { toQueryString } from "@/lib/api/query-string"
import type { ApiPaginatedResponse, ApiSuccessResponse } from "@/types/api/api.types"
import type { Employee } from "@/types/domain/hr.types"

interface EmployeesQuery {
  page?: number
  limit?: number
  search?: string
  status?: string
  departmentId?: number
}

export const employeesService = {
  async getList(params: EmployeesQuery = {}) {
    const query = toQueryString(params)
    const response = await apiClient.get<ApiPaginatedResponse<Employee>>(
      `/employees${query ? `?${query}` : ""}`,
    )
    return response.data
  },

  async getDetail(employeeId: number) {
    const response = await apiClient.get<ApiSuccessResponse<Employee>>(`/employees/${employeeId}`)
    return response.data.data
  },

  async getMe() {
    const response = await apiClient.get<ApiSuccessResponse<Employee>>("/employees/me")
    return response.data.data
  },
}
