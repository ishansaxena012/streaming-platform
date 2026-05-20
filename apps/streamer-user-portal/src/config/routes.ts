export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  SEARCH: "/search",
  WATCH: (id: string) => `/watch/${id}`,
  WATCH_PATH: "/watch/:id",
  PROFILES: "/profiles",
  SETTINGS: "/settings",
  SUBSCRIPTION: "/subscription",
} as const;
