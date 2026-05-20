import { lazy } from "react";
import { Outlet } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import { ProfileGuard } from "./profile-guard";
import { MainLayout } from "../layouts/main-layout";
import { ROUTES } from "../config/routes";

// Lazy load core portal pages
const HomePage = lazy(() =>
  import("../pages/home-page").then((m) => ({ default: m.HomePage }))
);
const SearchPage = lazy(() =>
  import("../pages/search-page").then((m) => ({ default: m.SearchPage }))
);
const SubscriptionPage = lazy(() =>
  import("../pages/subscription-page").then((m) => ({ default: m.SubscriptionPage }))
);
const SettingsPage = lazy(() =>
  import("../pages/settings-page").then((m) => ({ default: m.SettingsPage }))
);
const ProfilePage = lazy(() =>
  import("../pages/profile-page").then((m) => ({ default: m.ProfilePage }))
);

export const protectedRoutes: RouteObject[] = [
  // 1. Routes requiring Auth AND selected viewing Profile inside the Main Layout Shell
  {
    element: (
      <ProtectedRoute>
        <ProfileGuard>
          <MainLayout />
        </ProfileGuard>
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.HOME,
        element: <HomePage />,
      },
      {
        path: ROUTES.SEARCH,
        element: <SearchPage />,
      },
      {
        path: ROUTES.SUBSCRIPTION,
        element: <SubscriptionPage />,
      },
      {
        path: ROUTES.SETTINGS,
        element: <SettingsPage />,
      },
    ],
  },
  // 2. Profile Selection Screen (requires Auth, but bypasses ProfileGuard to select a profile)
  {
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.PROFILES,
        element: <ProfilePage />,
      },
    ],
  },
];
export default protectedRoutes;
