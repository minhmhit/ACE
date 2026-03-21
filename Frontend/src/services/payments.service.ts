import { apiClient } from "@/lib/api/axios"
import { toQueryString } from "@/lib/api/query-string"
import type { ApiPaginatedResponse, ApiSuccessResponse } from "@/types/api/api.types"
import type { CreatePaymentRequest, Payment, PaymentMethod } from "@/types/domain/payment.types"

interface PaymentsQuery {
  page?: number
  limit?: number
}

export const paymentsService = {
  async getMethods() {
    const response = await apiClient.get<ApiSuccessResponse<PaymentMethod[]>>("/payments/methods")
    return response.data.data
  },

  async create(payload: CreatePaymentRequest) {
    const response = await apiClient.post<ApiSuccessResponse<Payment>>("/payments", payload)
    return response.data.data
  },

  async getMyHistory(params: PaymentsQuery = {}) {
    const query = toQueryString(params)
    const response = await apiClient.get<ApiPaginatedResponse<Payment>>(
      `/payments/history${query ? `?${query}` : ""}`,
    )
    return response.data
  },

  async getByOrder(orderId: number) {
    const response = await apiClient.get<ApiSuccessResponse<Payment>>(`/payments/order/${orderId}`)
    return response.data.data
  },

  async getDetail(paymentId: number) {
    const response = await apiClient.get<ApiSuccessResponse<Payment>>(`/payments/${paymentId}`)
    return response.data.data
  },

  async getAdminList(params: PaymentsQuery = {}) {
    const query = toQueryString(params)
    const response = await apiClient.get<ApiPaginatedResponse<Payment>>(
      `/payments${query ? `?${query}` : ""}`,
    )
    return response.data
  },

  async confirm(paymentId: number) {
    const response = await apiClient.post<ApiSuccessResponse<Payment>>(
      `/payments/${paymentId}/confirm`,
    )
    return response.data.data
  },

  async fail(paymentId: number) {
    const response = await apiClient.post<ApiSuccessResponse<Payment>>(
      `/payments/${paymentId}/fail`,
    )
    return response.data.data
  },
}
