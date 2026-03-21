"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { cartService } from "@/services/cart.service"
import type { AddToCartRequest, Cart } from "@/types/domain/cart.types"

interface UpdateCartItemVars {
  itemId: number
  quantity: number
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AddToCartRequest) => cartService.addItem(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail })
    },
  })
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, quantity }: UpdateCartItemVars) =>
      cartService.updateItem(itemId, { quantity }),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.detail })

      const previous = queryClient.getQueryData<Cart>(queryKeys.cart.detail)
      if (!previous) {
        return { previous }
      }

      const nextItems = previous.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              totalPrice: quantity * item.unitPrice,
            }
          : item,
      )

      queryClient.setQueryData<Cart>(queryKeys.cart.detail, {
        ...previous,
        items: nextItems,
      })

      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.cart.detail, context.previous)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail })
    },
  })
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: number) => cartService.removeItem(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail })
    },
  })
}

export function useClearCartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cartService.clear(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail })
    },
  })
}
