import { apiClient, publicClient } from "@/lib/api/axios"
import {
  clearTokens,
  saveTokens,
  getRefreshToken,
  getRefreshTransportMode,
} from "@/lib/api/token-storage"
import type { ApiSuccessResponse } from "@/types/api/base"
import type { LoginPayload, LoginResponse, UserProfile, SessionItem } from "@/types/domain/auth"

export const authService = {
  async login(payload: LoginPayload) {
    const response = await publicClient.post<ApiSuccessResponse<LoginResponse>>(
      "/auth/login",
      payload,
    )

    saveTokens({
      accessToken: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken,
    })

    return response.data.data
  },

  async fetchMe() {
    const response = await apiClient.get<ApiSuccessResponse<UserProfile>>("/auth/me")
    return response.data.data
  },

  async logout() {
    const refreshMode = getRefreshTransportMode()
    const refreshToken = getRefreshToken()

    const payload = refreshMode === "body-token" ? { refreshToken } : undefined

    await apiClient.post("/auth/logout", payload)
  },

  async logoutAll() {
    const refreshMode = getRefreshTransportMode()
    const refreshToken = getRefreshToken()
    const payload = refreshMode === "body-token" ? { refreshToken } : undefined

    await apiClient.post("/auth/logout-all", payload)
  },

  async getSessions() {
    const response = await apiClient.get<ApiSuccessResponse<SessionItem[]>>("/auth/sessions")
    return response.data.data
  },

  async revokeSession(sessionId: string) {
    await apiClient.delete(`/auth/sessions/${sessionId}`)
  },

  clearLocalSession() {
    clearTokens()
  },
}
