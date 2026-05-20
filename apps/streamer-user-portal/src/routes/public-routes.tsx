import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { ROUTES } from "../config/routes";

export const publicRoutes: RouteObject[] = [
  {
    path: "*",
    element: <Navigate to={ROUTES.HOME} replace />,
  },
];
export default publicRoutes;
