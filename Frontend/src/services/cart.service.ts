import { apiClient } from "@/lib/api/axios"
import type { ApiSuccessResponse } from "@/types/api/api.types"
import type { AddToCartRequest, Cart, UpdateCartItemRequest } from "@/types/domain/cart.types"

export const cartService = {
  async getCart() {
    const response = await apiClient.get<ApiSuccessResponse<Cart>>("/cart")
    return response.data.data
  },

  async addItem(payload: AddToCartRequest) {
    const response = await apiClient.post<ApiSuccessResponse<Cart>>("/cart/add", payload)
    return response.data.data
  },

  async updateItem(itemId: number, payload: UpdateCartItemRequest) {
    const response = await apiClient.put<ApiSuccessResponse<Cart>>(
      `/cart/update/${itemId}`,
      payload,
    )
    return response.data.data
  },

  async removeItem(itemId: number) {
    const response = await apiClient.delete<ApiSuccessResponse<Cart>>(`/cart/remove/${itemId}`)
    return response.data.data
  },

  async clear() {
    await apiClient.delete("/cart/clear")
  },
}
