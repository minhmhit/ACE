"use client"

import { useEffect, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"

import { APP_ROUTES } from "@/constants/routes"
import type { RoleCode } from "@/constants/roles"
import { useAuthStore } from "@/stores/auth.store"

interface UseAuthGuardOptions {
  requiredRoles?: RoleCode[]
  redirectTo?: string
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { requiredRoles = [], redirectTo = APP_ROUTES.signIn } = options
  const router = useRouter()
  const pathname = usePathname()

  const user = useAuthStore((state) => state.currentUser)
  const hydrated = useAuthStore((state) => state.hydrated)
  const isHydrating = useAuthStore((state) => state.isHydrating)

  const isAllowed = useMemo(() => {
    if (!user) {
      return false
    }

    if (!requiredRoles.length) {
      return true
    }

    return requiredRoles.includes(user.role.code)
  }, [requiredRoles, user])

  useEffect(() => {
    if (!hydrated || isHydrating) {
      return
    }

    if (!user) {
      router.replace(`${redirectTo}?next=${encodeURIComponent(pathname)}`)
      return
    }

    if (!isAllowed) {
      router.replace(APP_ROUTES.forbidden)
    }
  }, [hydrated, isAllowed, isHydrating, pathname, redirectTo, router, user])

  return {
    user,
    hydrated,
    isHydrating,
    isAllowed,
  }
}
