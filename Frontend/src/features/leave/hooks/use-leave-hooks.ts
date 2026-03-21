"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { leaveService } from "@/services/leave.service"

interface LeaveQuery {
  page?: number
  limit?: number
}

interface CreateLeaveRequestPayload {
  leaveTypeId: number
  startDate: string
  endDate: string
  reason: string
}

export function useMyLeaveRequestsQuery(params: LeaveQuery = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.employee.leaveRequests(params),
    queryFn: () => leaveService.getMyRequests(params),
    staleTime: 60 * 1000,
    enabled,
  })
}

export function useCreateLeaveRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateLeaveRequestPayload) => leaveService.createRequest(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employee.leaveRequests({}) })
    },
  })
}

export function useCancelLeaveRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: number) => leaveService.cancelRequest(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employee.leaveRequests({}) })
    },
  })
}
