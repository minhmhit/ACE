"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { productsService } from "@/services/products.service"
import type { ProductListQuery } from "@/types/domain/product.types"

export function useProductsQuery(params: ProductListQuery = {}) {
  return useQuery({
    queryKey: queryKeys.products.products(params),
    queryFn: () => productsService.getList(params),
    staleTime: 3 * 60 * 1000,
  })
}
