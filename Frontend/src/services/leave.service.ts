import { apiClient } from "@/lib/api/axios"
import { toQueryString } from "@/lib/api/query-string"
import type { ApiPaginatedResponse, ApiSuccessResponse } from "@/types/api/api.types"
import type { LeaveRequest, LeaveType } from "@/types/domain/hr.types"

interface LeaveQuery {
  page?: number
  limit?: number
}

interface CreateLeaveRequestPayload {
  leaveTypeId: number
  startDate: string
  endDate: string
  reason: string
}

export const leaveService = {
  async getTypes() {
    const response = await apiClient.get<ApiSuccessResponse<LeaveType[]>>("/leave-types")
    return response.data.data
  },

  async getMyRequests(params: LeaveQuery = {}) {
    const query = toQueryString(params)
    const response = await apiClient.get<ApiPaginatedResponse<LeaveRequest>>(
      `/leave-requests${query ? `?${query}` : ""}`,
    )
    return response.data
  },

  async createRequest(payload: CreateLeaveRequestPayload) {
    const response = await apiClient.post<ApiSuccessResponse<LeaveRequest>>(
      "/leave-requests",
      payload,
    )
    return response.data.data
  },

  async cancelRequest(requestId: number) {
    const response = await apiClient.post<ApiSuccessResponse<LeaveRequest>>(
      `/leave-requests/${requestId}/cancel`,
    )
    return response.data.data
  },
}
