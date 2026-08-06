import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FullPageSpinner } from "../ui/alert";
import type { UserRole } from "../../types/auth.types";

interface ProtectedRouteProps {
  /** If omitted, any authenticated + active user may pass. */
  allowedRoles?: UserRole[];
}

/**
 * Route guard used as a layout route:
 *   <Route element={<ProtectedRoute allowedRoles={["owner","manager"]} />}>
 *     <Route path="/settings" element={<SettingsPage />} />
 *   </Route>
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { initializing, isAuthenticated, profile } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account exists but an owner/manager hasn't finished setting it up yet.
  if (!profile || profile.status !== "active" || !profile.role) {
    return <Navigate to="/403" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

/**
 * Inverse guard for the auth pages themselves (Login, Forgot Password) —
 * an already-logged-in user shouldn't be able to see the login form again.
 */
export function GuestOnlyRoute() {
  const { initializing, isAuthenticated } = useAuth();

  if (initializing) {
    return <FullPageSpinner />;
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
