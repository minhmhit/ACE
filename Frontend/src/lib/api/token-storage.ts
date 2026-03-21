import { STORAGE_KEYS } from "@/constants/storage-keys"

export type RefreshTransportMode = "body-token" | "httpOnly-cookie"

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface TokenPatch {
  accessToken?: string | null
  refreshToken?: string | null
}

interface TokenState {
  accessToken: string | null
  refreshToken: string | null
}

const tokenState: TokenState = {
  accessToken: null,
  refreshToken: null,
}

let refreshTransportMode: RefreshTransportMode = "body-token"

function hasWindow() {
  return typeof window !== "undefined"
}

export function setRefreshTransportMode(mode: RefreshTransportMode) {
  refreshTransportMode = mode
}

export function getRefreshTransportMode() {
  return refreshTransportMode
}

export function shouldAttachAccessTokenHeader() {
  return refreshTransportMode === "body-token"
}

export function setAccessToken(accessToken: string | null) {
  tokenState.accessToken = accessToken

  if (!hasWindow()) {
    return
  }

  if (!accessToken) {
    window.localStorage.removeItem(STORAGE_KEYS.accessToken)
    return
  }

  window.localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
}

export function setRefreshToken(refreshToken: string | null) {
  tokenState.refreshToken = refreshToken

  if (!hasWindow()) {
    return
  }

  if (!refreshToken) {
    window.localStorage.removeItem(STORAGE_KEYS.refreshToken)
    return
  }

  window.localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
}

export function saveTokens(tokens: TokenPatch) {
  if (tokens.accessToken !== undefined) {
    setAccessToken(tokens.accessToken ?? null)
  }

  if (tokens.refreshToken !== undefined) {
    setRefreshToken(tokens.refreshToken ?? null)
  }
}

export function getAccessToken() {
  if (tokenState.accessToken) {
    return tokenState.accessToken
  }

  if (!hasWindow()) {
    return null
  }

  const accessToken = window.localStorage.getItem(STORAGE_KEYS.accessToken)
  tokenState.accessToken = accessToken
  return accessToken
}

export function getRefreshToken() {
  if (tokenState.refreshToken) {
    return tokenState.refreshToken
  }

  if (!hasWindow()) {
    return null
  }

  const refreshToken = window.localStorage.getItem(STORAGE_KEYS.refreshToken)
  tokenState.refreshToken = refreshToken
  return refreshToken
}

export function clearTokens() {
  setAccessToken(null)
  setRefreshToken(null)
}

export function hydrateTokensFromStorage() {
  if (!hasWindow()) {
    return
  }

  tokenState.accessToken = window.localStorage.getItem(STORAGE_KEYS.accessToken)
  tokenState.refreshToken = window.localStorage.getItem(STORAGE_KEYS.refreshToken)
}
