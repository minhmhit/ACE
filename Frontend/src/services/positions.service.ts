import { apiClient } from "@/lib/api/axios"
import type { ApiSuccessResponse } from "@/types/api/api.types"
import type { Position } from "@/types/domain/hr.types"

export const positionsService = {
  async getList() {
    const response = await apiClient.get<ApiSuccessResponse<Position[]>>("/positions")
    return response.data.data
  },

  async getDetail(positionId: number) {
    const response = await apiClient.get<ApiSuccessResponse<Position>>(`/positions/${positionId}`)
    return response.data.data
  },
}
