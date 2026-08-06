import type { AuthError } from "../types/auth.types";

/** * Supabase returns free-text error messages, not stable error codes for * every case. We match on message content (lower-cased) so the UI never * shows a raw Postgres/GoTrue string to a shop owner. */
export function normalizeAuthError(err: unknown): AuthError {
  if (err instanceof Error === false && typeof err !== "object") {
    return { code: "unknown", message: "error.unknown" };
  }

  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "object" && err !== null && "message" in err
      ? String((err as { message: unknown }).message)
      : "";

  const msg = raw.toLowerCase();

  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return { code: "network_error", message: "error.network_error" };
  }
  if (msg.includes("invalid login credentials")) {
    return { code: "invalid_credentials", message: "error.invalid_credentials" };
  }
  if (msg.includes("email not confirmed")) {
    return { code: "email_not_confirmed", message: "error.email_not_confirmed" };
  }
  if (msg.includes("user not found")) {
    return { code: "user_not_found", message: "error.user_not_found" };
  }
  if (
    msg.includes("expired") ||
    msg.includes("invalid") && msg.includes("token")
  ) {
    return { code: "reset_link_expired", message: "error.reset_link_expired" };
  }
  if (msg.includes("session") && msg.includes("expired")) {
    return { code: "session_expired", message: "error.session_expired" };
  }
  if (msg.includes("password") && msg.includes("weak")) {
    return { code: "weak_password", message: "error.weak_password" };
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return { code: "rate_limited", message: "error.rate_limited" };
  }

  return { code: "unknown", message: "error.unknown" };
}
