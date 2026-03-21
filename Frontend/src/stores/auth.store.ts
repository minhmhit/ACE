"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import { STORAGE_KEYS } from "@/constants/storage-keys"
import { configureHttpClientAuthHandlers } from "@/lib/api/axios"
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  hydrateTokensFromStorage,
  saveTokens,
} from "@/lib/api/token-storage"
import { authService } from "@/services/auth.service"
import type { AuthStatus, LoginPayload, UserProfile } from "@/types/domain/auth"
import { clearAuthMetaCookie, setAuthMetaCookie } from "@/utils/auth-meta-cookie"

interface AuthState {
  currentUser: UserProfile | null
  accessToken: string | null
  refreshToken: string | null
  status: AuthStatus
  isHydrating: boolean
  isLoading: boolean
  hydrated: boolean
  login: (payload: LoginPayload) => Promise<UserProfile>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  fetchMe: () => Promise<UserProfile | null>
  hydrateAuth: () => Promise<void>
  syncTokens: (tokens: { accessToken?: string | null; refreshToken?: string | null }) => void
  setCurrentUser: (user: UserProfile | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      configureHttpClientAuthHandlers({
        onTokensRefreshed: (tokens) => {
          get().syncTokens(tokens)
        },
        onAuthFailure: () => {
          get().clearAuth()
        },
      })

      return {
        currentUser: null,
        accessToken: null,
        refreshToken: null,
        status: "idle",
        isHydrating: true,
        isLoading: false,
        hydrated: false,

        login: async (payload) => {
          set({ isLoading: true, status: "loading" })

          try {
            const result = await authService.login(payload)

            saveTokens({
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
            })

            setAuthMetaCookie(result.user.role.code)
            set({
              currentUser: result.user,
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
              status: "authenticated",
              isLoading: false,
            })

            return result.user
          } catch (error) {
            set({ isLoading: false, status: "anonymous" })
            throw error
          }
        },

        logout: async () => {
          set({ isLoading: true })
          try {
            await authService.logout()
          } finally {
            get().clearAuth()
            set({ isLoading: false })
          }
        },

        logoutAll: async () => {
          set({ isLoading: true })
          try {
            await authService.logoutAll()
          } finally {
            get().clearAuth()
            set({ isLoading: false })
          }
        },

        fetchMe: async () => {
          try {
            const profile = await authService.fetchMe()
            setAuthMetaCookie(profile.role.code)
            set({ currentUser: profile, status: "authenticated" })
            return profile
          } catch {
            get().clearAuth()
            return null
          }
        },

        hydrateAuth: async () => {
          if (get().hydrated && !get().isHydrating) {
            return
          }

          set({ isHydrating: true, status: "loading" })

          hydrateTokensFromStorage()
          const accessToken = getAccessToken()
          const refreshToken = getRefreshToken()

          if (!accessToken && !refreshToken) {
            set({
              currentUser: null,
              accessToken: null,
              refreshToken: null,
              status: "anonymous",
              isHydrating: false,
              hydrated: true,
            })
            return
          }

          set({ accessToken, refreshToken })
          await get().fetchMe()

          set({ isHydrating: false, hydrated: true })
        },

        syncTokens: (tokens) => {
          const nextAccessToken = tokens.accessToken ?? getAccessToken()
          const nextRefreshToken = tokens.refreshToken ?? getRefreshToken()

          saveTokens({
            accessToken: nextAccessToken,
            refreshToken: nextRefreshToken,
          })

          set({
            accessToken: nextAccessToken,
            refreshToken: nextRefreshToken,
          })
        },

        setCurrentUser: (user) => {
          if (user) {
            setAuthMetaCookie(user.role.code)
          } else {
            clearAuthMetaCookie()
          }

          set({
            currentUser: user,
            status: user ? "authenticated" : "anonymous",
          })
        },

        clearAuth: () => {
          authService.clearLocalSession()
          clearTokens()
          clearAuthMetaCookie()
          set({
            currentUser: null,
            accessToken: null,
            refreshToken: null,
            status: "anonymous",
            isHydrating: false,
            hydrated: true,
          })
        },
      }
    },
    {
      name: STORAGE_KEYS.auth,
      partialize: (state) => ({
        currentUser: state.currentUser,
        status: state.status,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }

        state.hydrated = true
      },
    },
  ),
)
