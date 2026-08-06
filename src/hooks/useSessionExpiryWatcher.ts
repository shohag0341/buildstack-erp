import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

/** * Distinguishes a deliberate logout (user clicked "Log Out") from an * involuntary one (refresh token invalid/expired) and fires onExpire only * for the latter, so the app can redirect to /login with a * "session expired" message instead of silently vanishing. */
export function useSessionExpiryWatcher(onExpire: () => void) {
  const { isAuthenticated } = useAuth();
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && wasAuthenticated.current) {
        onExpire();
      }
    });
    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
