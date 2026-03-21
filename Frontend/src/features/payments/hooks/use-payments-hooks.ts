"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { paymentsService } from "@/services/payments.service"
import type { CreatePaymentRequest } from "@/types/domain/payment.types"

interface PaymentsQuery {
  page?: number
  limit?: number
}

export function usePaymentMethodsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.methods,
    queryFn: paymentsService.getMethods,
    staleTime: 5 * 60 * 1000,
    enabled,
  })
}

export function useMyPaymentHistoryQuery(params: PaymentsQuery = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.myHistory(params),
    queryFn: () => paymentsService.getMyHistory(params),
    staleTime: 30 * 1000,
    enabled,
  })
}

export function usePaymentDetailQuery(paymentId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.detail(paymentId),
    queryFn: () => paymentsService.getDetail(paymentId),
    staleTime: 30 * 1000,
    enabled: enabled && Number.isFinite(paymentId),
  })
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePaymentRequest) => paymentsService.create(payload),
    onSuccess: (payment) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.myHistory({}) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(payment.id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(payment.orderId) })
    },
  })
}
