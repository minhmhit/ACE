import { apiClient } from "@/lib/api/axios"
import { toQueryString } from "@/lib/api/query-string"
import type { ApiPaginatedResponse, ApiSuccessResponse } from "@/types/api/api.types"
import type {
  CreateOrderRequest,
  Order,
  UpdateOrderStatusRequest,
} from "@/types/domain/order.types"

interface OrdersQuery {
  page?: number
  limit?: number
}

export const ordersService = {
  async create(payload: CreateOrderRequest) {
    const response = await apiClient.post<ApiSuccessResponse<Order>>("/orders/add", payload)
    return response.data.data
  },

  async getMyOrders(params: OrdersQuery = {}) {
    const query = toQueryString(params)
    const response = await apiClient.get<ApiPaginatedResponse<Order>>(
      `/orders${query ? `?${query}` : ""}`,
    )
    return response.data
  },

  async getDetail(orderId: number) {
    const response = await apiClient.get<ApiSuccessResponse<Order>>(`/orders/${orderId}`)
    return response.data.data
  },

  async cancel(orderId: number) {
    const response = await apiClient.put<ApiSuccessResponse<Order>>(`/orders/${orderId}/cancel`)
    return response.data.data
  },

  async getAdminOrders(params: OrdersQuery = {}) {
    const query = toQueryString(params)
    const response = await apiClient.get<ApiPaginatedResponse<Order>>(
      `/orders/admin/all${query ? `?${query}` : ""}`,
    )
    return response.data
  },

  async updateStatus(orderId: number, payload: UpdateOrderStatusRequest) {
    const response = await apiClient.put<ApiSuccessResponse<Order>>(
      `/orders/${orderId}/status`,
      payload,
    )
    return response.data.data
  },
}
