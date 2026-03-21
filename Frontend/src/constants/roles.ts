export const ROLE_CODES = {
  ADMIN: "ADMIN",
  USER: "USER",
  WAREHOUSE: "WAREHOUSE",
  SALE: "SALE",
  HRM: "HRM",
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

export const ADMIN_ROLES: RoleCode[] = [ROLE_CODES.ADMIN];

export const EMPLOYEE_ROLES: RoleCode[] = [
  ROLE_CODES.ADMIN,
  ROLE_CODES.HRM,
  ROLE_CODES.WAREHOUSE,
  ROLE_CODES.SALE,
];
