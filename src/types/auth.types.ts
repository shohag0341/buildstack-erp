/** * BuildStack ERP — Auth domain types * Strict TypeScript: no `any`, every shape explicit. */

export type UserRole =
  | "owner"
  | "manager"
  | "accountant"
  | "salesman"
  | "godown_manager";

export type UserStatus = "active" | "inactive" | "pending";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: UserRole | null;
  status: UserStatus;
  company_id: string | null;
  branch_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  created_at: string;
}

export interface Branch {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
}

/** Shape returned by the auth context to every consumer in the app. */
export interface AuthState {
  /** true while the initial session restore / profile fetch is in flight */
  initializing: boolean;
  /** Supabase auth user id, or null when signed out */
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  isAuthenticated: boolean;
}

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileFormValues {
  full_name: string;
  phone: string;
}

/** Normalized, user-facing error shape used across every auth form. */
export interface AuthError {
  code:
    | "invalid_credentials"
    | "user_not_found"
    | "email_not_confirmed"
    | "network_error"
    | "session_expired"
    | "reset_link_expired"
    | "weak_password"
    | "same_password"
    | "rate_limited"
    | "unknown";
  message: string;
  }
