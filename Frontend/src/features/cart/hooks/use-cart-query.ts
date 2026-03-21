"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { cartService } from "@/services/cart.service"

export function useCartQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.cart.detail,
    queryFn: cartService.getCart,
    staleTime: 10 * 1000,
    enabled,
  })
}
