"use client"

import type { RoleCode } from "@/constants/roles"
import { useAuthGuard } from "@/hooks/common/use-auth-guard"
import { LoadingState } from "@/components/shared/states/loading-state"

interface ProtectedLayoutProps {
  children: React.ReactNode
  requiredRoles?: RoleCode[]
}

export function ProtectedLayout({ children, requiredRoles }: ProtectedLayoutProps) {
  const { hydrated, isAllowed, isHydrating, user } = useAuthGuard({ requiredRoles })

  if (!hydrated || isHydrating || !user) {
    return (
      <div className="mx-auto w-full max-w-4xl py-12">
        <LoadingState />
      </div>
    )
  }

  if (!isAllowed) {
    return null
  }

  return <>{children}</>
}
