"use client"

import { useRouter } from "next/navigation"

import { APP_ROUTES } from "@/constants/routes"
import { useAuthStore } from "@/stores/auth.store"

export function useAuthActions() {
  const router = useRouter()
  const logoutStore = useAuthStore((state) => state.logout)
  const logoutAllStore = useAuthStore((state) => state.logoutAll)

  const logout = async () => {
    await logoutStore()
    router.replace(APP_ROUTES.signIn)
  }

  const logoutAll = async () => {
    await logoutAllStore()
    router.replace(APP_ROUTES.signIn)
  }

  return { logout, logoutAll }
}
