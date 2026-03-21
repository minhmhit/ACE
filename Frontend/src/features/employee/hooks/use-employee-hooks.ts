"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { employeesService } from "@/services/employees.service"

export function useMyEmployeeProfileQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.employee.me,
    queryFn: employeesService.getMe,
    staleTime: 60 * 1000,
    enabled,
  })
}
