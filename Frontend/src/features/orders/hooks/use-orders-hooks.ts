"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { ordersService } from "@/services/orders.service"
import type { CreateOrderRequest } from "@/types/domain/order.types"

interface OrdersQuery {
  page?: number
  limit?: number
}

export function useMyOrdersQuery(params: OrdersQuery = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.orders.myList(params),
    queryFn: () => ordersService.getMyOrders(params),
    staleTime: 30 * 1000,
    enabled,
  })
}

export function useOrderDetailQuery(orderId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => ordersService.getDetail(orderId),
    staleTime: 30 * 1000,
    enabled: enabled && Number.isFinite(orderId),
  })
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateOrderRequest) => ordersService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.myList({}) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail })
    },
  })
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => ordersService.cancel(orderId),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.myList({}) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(order.id) })
    },
  })
}
