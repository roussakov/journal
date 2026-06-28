export type UserRole = "admin" | "viewer";

export function isAdminRole(role: unknown): role is UserRole {
  return role === "admin";
}

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: UserRole;
    };
  }
}

export {};
