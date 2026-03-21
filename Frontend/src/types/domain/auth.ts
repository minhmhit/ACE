import type { RoleCode } from "@/constants/roles"

export interface UserRole {
  id: number
  code: RoleCode
  name: string
}

export interface UserProfile {
  id: number
  email: string
  name: string
  phoneNumber?: string
  avatarUrl?: string
  isActive: boolean
  roleId: number
  role: UserRole
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: UserProfile
  accessToken: string
  refreshToken: string
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "anonymous"

export interface SessionItem {
  id: string
  deviceName?: string
  userAgent?: string
  ipAddress?: string
  lastActiveAt?: string
  createdAt?: string
  isCurrent?: boolean
}
