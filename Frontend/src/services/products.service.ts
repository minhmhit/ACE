import { publicClient } from "@/lib/api/axios"
import { toQueryString } from "@/lib/api/query-string"
import type { ApiPaginatedResponse, ApiSuccessResponse } from "@/types/api/api.types"
import type { Product, ProductListQuery, ProductSearchRequest } from "@/types/domain/product.types"

export const productsService = {
  async getList(params: ProductListQuery = {}) {
    const query = toQueryString(params)
    const response = await publicClient.get<ApiPaginatedResponse<Product>>(
      `/product${query ? `?${query}` : ""}`,
    )
    return response.data
  },

  async search(params: ProductSearchRequest) {
    const query = toQueryString({
      keyword: params.keyword,
      page: params.page,
      limit: params.limit,
    })

    const response = await publicClient.get<ApiPaginatedResponse<Product>>(
      `/product/search?${query}`,
    )
    return response.data
  },

  async getDetail(productId: number) {
    const response = await publicClient.get<ApiSuccessResponse<Product>>(`/product/${productId}`)
    return response.data.data
  },
}
