"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { attendanceService } from "@/services/attendance.service"
import type { AttendanceQuery } from "@/types/domain/attendance.types"

export function useMyAttendanceQuery(params: AttendanceQuery = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.employee.attendance(params),
    queryFn: () => attendanceService.getList(params),
    staleTime: 60 * 1000,
    enabled,
  })
}

export function useCheckInMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => attendanceService.checkIn(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employee.attendance({}) })
    },
  })
}

export function useCheckOutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => attendanceService.checkOut(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employee.attendance({}) })
    },
  })
}
