import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { I18nProvider } from "./lib/i18n";
import { ProtectedRoute, GuestOnlyRoute } from "./components/auth/ProtectedRoute";

import LoginPage from "./pages/auth/Login";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import ResetPasswordPage from "./pages/auth/ResetPassword";
import ProfilePage from "./pages/auth/Profile";
import ChangePasswordPage from "./pages/auth/ChangePassword";
import UnauthorizedPage from "./pages/errors/Unauthorized";

// Placeholder target from OUTSIDE this module — Module 02 (Dashboard) will
// replace this import. It is intentionally not part of Module 01's scope.
function DashboardPlaceholder() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F4EF] p-6 text-center">
      <p className="text-sm text-[#6B6656]">
        Dashboard renders here — built in Module 02.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Public / guest-only auth pages */}
            <Route element={<GuestOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Reset Password must stay reachable while "logged out" because
                Supabase gives a temporary recovery session, not a normal one */}
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Authenticated + active-user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPlaceholder />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>

            {/* Example of a role-restricted route for later modules:
            <Route element={<ProtectedRoute allowedRoles={["owner","manager"]} />}>
              <Route path="/settings" element={<SettingsPage />} />
            </Route> */}

            <Route path="/403" element={<UnauthorizedPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}
