import { apiClient } from "@/lib/api/axios"
import { toQueryString } from "@/lib/api/query-string"
import type { ApiPaginatedResponse, ApiSuccessResponse } from "@/types/api/api.types"
import type { AttendanceItem, AttendanceQuery } from "@/types/domain/attendance.types"

export const attendanceService = {
  async getList(params: AttendanceQuery = {}) {
    const query = toQueryString(params)
    const response = await apiClient.get<ApiPaginatedResponse<AttendanceItem>>(
      `/attendance${query ? `?${query}` : ""}`,
    )
    return response.data
  },

  async checkIn() {
    const response =
      await apiClient.post<ApiSuccessResponse<AttendanceItem>>("/attendance/check-in")
    return response.data.data
  },

  async checkOut() {
    const response =
      await apiClient.post<ApiSuccessResponse<AttendanceItem>>("/attendance/check-out")
    return response.data.data
  },
}
