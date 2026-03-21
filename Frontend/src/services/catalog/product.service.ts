import { publicClient } from "@/lib/api/axios"
import type { ApiPaginatedResponse } from "@/types/api/base"

interface ProductSummary {
  id: number
  name: string
  price: number
  imageUrl?: string
}

export const productService = {
  async getProducts(page = 1, limit = 12) {
    const response = await publicClient.get<ApiPaginatedResponse<ProductSummary>>(
      `/product?page=${page}&limit=${limit}`,
    )

    return response.data
  },
}
