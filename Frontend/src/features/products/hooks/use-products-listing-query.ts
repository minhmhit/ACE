"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { productsService } from "@/services/products.service"
import type { ProductListQuery } from "@/types/domain/product.types"

interface ProductsListingParams extends ProductListQuery {
  keyword?: string
}

export function useProductsListingQuery(params: ProductsListingParams) {
  const hasKeyword = Boolean(params.keyword?.trim())

  return useQuery({
    queryKey: queryKeys.products.products({
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      keyword: params.keyword ?? "",
    }),
    queryFn: async () => {
      if (hasKeyword) {
        return productsService.search({
          keyword: params.keyword ?? "",
          page: params.page,
          limit: params.limit,
        })
      }

      return productsService.getList({
        page: params.page,
        limit: params.limit,
      })
    },
    staleTime: 60 * 1000,
  })
}
