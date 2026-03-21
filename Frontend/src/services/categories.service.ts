import { publicClient } from "@/lib/api/axios"
import type { ApiSuccessResponse } from "@/types/api/api.types"
import type { Category } from "@/types/domain/product.types"

export const categoriesService = {
  async getList() {
    const response = await publicClient.get<ApiSuccessResponse<Category[]>>("/category")
    return response.data.data
  },

  async getDetail(categoryId: number) {
    const response = await publicClient.get<ApiSuccessResponse<Category>>(`/category/${categoryId}`)
    return response.data.data
  },
}
