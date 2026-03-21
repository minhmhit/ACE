"use client"

import { useQuery } from "@tanstack/react-query"

import { variantsService } from "@/services/variants.service"

export function useProductVariantsQuery(productId: number) {
  return useQuery({
    queryKey: ["products", "variants", productId],
    queryFn: () => variantsService.getByProductId(productId),
    enabled: Number.isFinite(productId),
    staleTime: 3 * 60 * 1000,
  })
}
