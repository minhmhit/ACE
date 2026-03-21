import { apiClient } from "@/lib/api/axios"
import { toQueryString } from "@/lib/api/query-string"
import type { ApiSuccessResponse } from "@/types/api/api.types"
import type {
  DashboardRecentOrder,
  DateRangeQuery,
  LowStockItem,
  SalesOverview,
} from "@/types/domain/dashboard.types"

export const dashboardService = {
  async getSalesOverview(params: DateRangeQuery = {}) {
    const query = toQueryString(params)
    const response = await apiClient.get<ApiSuccessResponse<SalesOverview>>(
      `/dashboard/sales${query ? `?${query}` : ""}`,
    )
    return response.data.data
  },

  async getRecentOrders(params: DateRangeQuery = {}) {
    const query = toQueryString(params)
    const response = await apiClient.get<ApiSuccessResponse<DashboardRecentOrder[]>>(
      `/dashboard/recent-orders${query ? `?${query}` : ""}`,
    )
    return response.data.data
  },

  async getLowStock() {
    const response = await apiClient.get<ApiSuccessResponse<LowStockItem[]>>("/inventory/low-stock")
    return response.data.data
  },
}
