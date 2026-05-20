import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { ROUTES } from "../config/routes";

interface ProfileGuardProps {
  children: ReactNode;
}

export function ProfileGuard({ children }: ProfileGuardProps) {
  const activeProfile = useAuthStore((state) => state.activeProfile);
  const location = useLocation();

  // If authenticated but no active profile has been selected, force select
  if (!activeProfile && location.pathname !== ROUTES.PROFILES) {
    return <Navigate to={ROUTES.PROFILES} replace />;
  }

  return <>{children}</>;
}
export default ProfileGuard;
