import type { RoleCode } from "@/constants/roles";

const COOKIE_NAME = "coffee_auth_meta";
const ONE_DAY_SECONDS = 24 * 60 * 60;

export function setAuthMetaCookie(roleCode: RoleCode) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${COOKIE_NAME}=${roleCode}; path=/; max-age=${ONE_DAY_SECONDS}; samesite=lax`;
}

export function clearAuthMetaCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}
