import { apiClient } from "@/lib/api/axios"
import { toQueryString } from "@/lib/api/query-string"
import type { ApiPaginatedResponse, ApiSuccessResponse } from "@/types/api/api.types"
import type { Payroll, PayrollPeriod } from "@/types/domain/payroll.types"

interface PayrollQuery {
  page?: number
  limit?: number
  month?: number
  year?: number
}

export const payrollService = {
  async getPeriods(params: PayrollQuery = {}) {
    const query = toQueryString(params)
    const response = await apiClient.get<ApiPaginatedResponse<PayrollPeriod>>(
      `/payroll-periods${query ? `?${query}` : ""}`,
    )
    return response.data
  },

  async getMyPayrolls(params: PayrollQuery = {}) {
    const query = toQueryString(params)
    const response = await apiClient.get<ApiPaginatedResponse<Payroll>>(
      `/payrolls/me${query ? `?${query}` : ""}`,
    )
    return response.data
  },

  async getDetail(payrollId: number) {
    const response = await apiClient.get<ApiSuccessResponse<Payroll>>(`/payrolls/${payrollId}`)
    return response.data.data
  },
}
