import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import { ProfileGuard } from "./profile-guard";
import { PlayerLayout } from "../layouts/player-layout";
import { ROUTES } from "../config/routes";

// Lazy load watch page
const WatchPage = lazy(() =>
  import("../pages/watch-page").then((m) => ({ default: m.WatchPage }))
);

export const playerRoutes: RouteObject[] = [
  {
    element: (
      <ProtectedRoute>
        <ProfileGuard>
          <PlayerLayout />
        </ProfileGuard>
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.WATCH_PATH,
        element: <WatchPage />,
      },
    ],
  },
];
export default playerRoutes;
