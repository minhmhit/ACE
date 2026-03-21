import { publicClient } from "@/lib/api/axios"
import type { ApiSuccessResponse } from "@/types/api/api.types"
import type { ProductVariant } from "@/types/domain/product.types"

export const variantsService = {
  async getByProductId(productId: number) {
    const response = await publicClient.get<ApiSuccessResponse<ProductVariant[]>>(
      `/variants/product/${productId}`,
    )

    return response.data.data
  },
}
