/**
 * Application route constants
 * Centralized route definitions for type-safe navigation
 */
export const ROUTES = {
  HOME: "/home" as const,
  SIGN_IN: "/auth" as const,
  COMPLAINS: "/(complains)" as const,
  INFRASTRUCTURE: "/(infrastructure)" as const,
  NEWS: "/(news)" as const,
  PROJECTS: "/(projects)" as const,
  TAX: "/(tax)" as const,
  ADVISER: "/(adviser)" as const,
  BUDGET: "/(budget)" as const,
  PROFILE: "/editUser" as const,
  NOTIFICATIONS: "/(notification)/NotificationList" as const,
} as const;

// Type for route values
export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
