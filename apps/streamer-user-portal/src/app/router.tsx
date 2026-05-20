import { createBrowserRouter, Outlet } from "react-router-dom";
import { Suspense } from "react";
import { PageLoader } from "../components/loading/page-loader";
import { RouteErrorFallback } from "../components/errors/route-error-fallback";
import { authRoutes } from "../routes/auth-routes";
import { protectedRoutes } from "../routes/protected-routes";
import { playerRoutes } from "../routes/player-routes";
import { publicRoutes } from "../routes/public-routes";

export const router = createBrowserRouter([
  {
    element: (
      // Lazy loads dynamic components and binds full metallic pulses spinners during chunk transitions
      <Suspense fallback={<PageLoader message="Loading content segments..." />}>
        <Outlet />
      </Suspense>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      ...authRoutes,
      ...protectedRoutes,
      ...playerRoutes,
      ...publicRoutes,
    ],
  },
]);
export default router;
