"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { productsService } from "@/services/products.service"

export function useProductDetailQuery(productId: number) {
  return useQuery({
    queryKey: queryKeys.products.productDetail(productId),
    queryFn: () => productsService.getDetail(productId),
    staleTime: 3 * 60 * 1000,
    enabled: Number.isFinite(productId),
  })
}
