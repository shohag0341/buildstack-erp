import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly at build/boot time instead of silently breaking every
  // auth call later — much easier to debug from a phone.
  throw new Error(
    "Missing Supabase environment variables. Set VITE_SUPABASE_URL and " +
      "VITE_SUPABASE_ANON_KEY in your .env file (see .env.example) and in " +
      "your Vercel project's Environment Variables settings."
  );
}

const REMEMBER_FLAG_KEY = "buildstack-remember-me";

/** * "Remember Me" implementation: * - checked -> session lives in localStorage (survives browser close) * - unchecked -> session lives in sessionStorage (cleared when the tab/app closes) * The flag itself must live in localStorage so we know which storage to * read from on the NEXT app boot, before Supabase has restored anything. */
export function setRememberMe(remember: boolean): void {
  localStorage.setItem(REMEMBER_FLAG_KEY, remember ? "1" : "0");
}

/** * Supabase picks its storage object once at client-creation time, but we * don't know the user's "Remember Me" choice until they submit the login * form. This adapter defers the localStorage-vs-sessionStorage decision to * EVERY individual read/write, by checking the flag each time, so a single * client instance can serve both cases correctly. */
const adaptiveStorage = {
  getItem(key: string): string | null {
    const remembered = localStorage.getItem(REMEMBER_FLAG_KEY);
    const store = remembered === "0" ? sessionStorage : localStorage;
    return store.getItem(key);
  },
  setItem(key: string, value: string): void {
    const remembered = localStorage.getItem(REMEMBER_FLAG_KEY);
    const store = remembered === "0" ? sessionStorage : localStorage;
    store.setItem(key, value);
  },
  removeItem(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "buildstack-erp-auth",
    storage: adaptiveStorage,
  },
});
