"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { payrollService } from "@/services/payroll.service"

interface PayrollQuery {
  page?: number
  limit?: number
  month?: number
  year?: number
}

export function useMyPayrollsQuery(params: PayrollQuery = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.employee.payrolls(params),
    queryFn: () => payrollService.getMyPayrolls(params),
    staleTime: 60 * 1000,
    enabled,
  })
}

export function usePayrollDetailQuery(payrollId: number, enabled = true) {
  return useQuery({
    queryKey: ["employee", "payroll-detail", payrollId],
    queryFn: () => payrollService.getDetail(payrollId),
    staleTime: 60 * 1000,
    enabled: enabled && Number.isFinite(payrollId),
  })
}
