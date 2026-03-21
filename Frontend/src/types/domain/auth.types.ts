export type RoleCode = "ADMIN" | "USER" | "WAREHOUSE" | "SALE" | "HRM"

export interface UserRole {
  id: number
  code: RoleCode
  name: string
}

export interface CurrentUser {
  id: number
  email: string
  name: string
  phoneNumber?: string
  avatarUrl?: string
  isActive: boolean
  roleId: number
  role: UserRole
  createdAt?: string
  updatedAt?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: CurrentUser
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}

export interface SessionItem {
  id: string
  deviceName?: string
  userAgent?: string
  ipAddress?: string
  createdAt?: string
  lastActiveAt?: string
  isCurrent?: boolean
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "anonymous"
