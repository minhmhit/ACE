"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/constants/query-keys"
import { authService } from "@/services/auth.service"

export function useSessionsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.sessions,
    queryFn: authService.getSessions,
    staleTime: 30 * 1000,
    enabled,
  })
}
