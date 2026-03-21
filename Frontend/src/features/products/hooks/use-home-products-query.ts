"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { productsService } from "@/services/products.service"

export function useFeaturedProductsQuery(limit = 8) {
  return useQuery({
    queryKey: [...queryKeys.products.featured, limit],
    queryFn: () => productsService.getList({ page: 1, limit }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useNewestProductsQuery(limit = 8) {
  return useQuery({
    queryKey: [...queryKeys.products.newest, limit],
    queryFn: () => productsService.getList({ page: 1, limit }),
    staleTime: 5 * 60 * 1000,
  })
}
