import { useAuthContext } from "../context/AuthContext";

/** * Thin, stable public entry point. Pages/components should import this * hook rather than reaching into AuthContext directly — keeps the context * free to be refactored without touching every page. */
export function useAuth() {
  return useAuthContext();
}
