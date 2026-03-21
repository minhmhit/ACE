"use client"

import { useMutation } from "@tanstack/react-query"

import { useAuthStore } from "@/stores/auth.store"
import type { LoginPayload } from "@/types/domain/auth"

export function useLogin() {
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
  })
}
