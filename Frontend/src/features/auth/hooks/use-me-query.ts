"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { authService } from "@/services/auth.service"

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authService.fetchMe,
    staleTime: 60 * 1000,
    enabled,
  })
}
