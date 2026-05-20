import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { GuestRoute } from "./guest-route";
import { AuthLayout } from "../layouts/auth-layout";
import { ROUTES } from "../config/routes";

// Lazy load authentications pages
const LoginPage = lazy(() =>
  import("../pages/login-page").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("../pages/register-page").then((m) => ({ default: m.RegisterPage }))
);

export const authRoutes: RouteObject[] = [
  {
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.REGISTER,
        element: <RegisterPage />,
      },
    ],
  },
];
export default authRoutes;
