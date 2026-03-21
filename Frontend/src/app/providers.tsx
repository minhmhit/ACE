"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useEffect } from "react"

import { queryClient } from "@/lib/query/query-client"
import { ThemeProvider } from "@/lib/theme/theme-provider"
import { useAuthStore } from "@/stores/auth.store"

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth)

  useEffect(() => {
    void hydrateAuth()
  }, [hydrateAuth])

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
