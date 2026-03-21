import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios"

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getRefreshTransportMode,
  saveTokens,
  shouldAttachAccessTokenHeader,
  type TokenPatch,
} from "@/lib/api/token-storage"
import {
  rejectWaitingRequests,
  resolveWaitingRequests,
  waitForTokenRefresh,
} from "@/lib/api/request-queue"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1"

const baseConfig = {
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
}

const refreshClient = axios.create(baseConfig)

export const publicClient: AxiosInstance = axios.create(baseConfig)
export const apiClient: AxiosInstance = axios.create(baseConfig)

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponse {
  data: {
    accessToken: string
    refreshToken?: string
    expiresIn?: number
  }
}

type HttpClientAuthHandlers = {
  onTokensRefreshed?: (tokens: TokenPatch) => void
  onAuthFailure?: () => void | Promise<void>
}

const authHandlers: HttpClientAuthHandlers = {}

let isRefreshing = false

function setAuthorizationHeader(config: RetryableRequestConfig, accessToken: string) {
  const currentHeaders = AxiosHeaders.from(config.headers)
  currentHeaders.set("Authorization", `Bearer ${accessToken}`)
  config.headers = currentHeaders
}

function isAuthEndpoint(url = "") {
  return url.includes("/auth/login") || url.includes("/auth/refresh")
}

async function performRefreshToken() {
  const refreshMode = getRefreshTransportMode()
  const refreshToken = getRefreshToken()

  if (refreshMode === "body-token" && !refreshToken) {
    throw new Error("Missing refresh token")
  }

  const payload = refreshMode === "body-token" ? { refreshToken } : undefined
  const response = await refreshClient.post<RefreshResponse>("/auth/refresh", payload)

  const nextAccessToken = response.data.data.accessToken
  const nextRefreshToken = response.data.data.refreshToken ?? refreshToken ?? null

  saveTokens({
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
  })

  authHandlers.onTokensRefreshed?.({
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken ?? undefined,
  })

  return nextAccessToken
}

export function configureHttpClientAuthHandlers(handlers: HttpClientAuthHandlers) {
  authHandlers.onTokensRefreshed = handlers.onTokensRefreshed
  authHandlers.onAuthFailure = handlers.onAuthFailure
}

apiClient.interceptors.request.use((config) => {
  if (!shouldAttachAccessTokenHeader()) {
    return config
  }

  const accessToken = getAccessToken()
  if (accessToken) {
    const currentHeaders = AxiosHeaders.from(config.headers)
    currentHeaders.set("Authorization", `Bearer ${accessToken}`)
    config.headers = currentHeaders
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status

    if (!originalRequest || !status) {
      return Promise.reject(error)
    }

    if (status === 403) {
      return Promise.reject(error)
    }

    if (status !== 401 || originalRequest._retry || isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      try {
        const queuedToken = await waitForTokenRefresh()
        setAuthorizationHeader(originalRequest, queuedToken)
        return apiClient(originalRequest)
      } catch (queueError) {
        return Promise.reject(queueError)
      }
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const accessToken = await performRefreshToken()
      resolveWaitingRequests(accessToken)
      setAuthorizationHeader(originalRequest, accessToken)
      return apiClient(originalRequest)
    } catch (refreshError) {
      clearTokens()
      rejectWaitingRequests(refreshError)
      await authHandlers.onAuthFailure?.()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
