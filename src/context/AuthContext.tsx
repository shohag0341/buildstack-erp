import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, setRememberMe } from "../lib/supabase";
import { normalizeAuthError } from "../lib/authErrors";
import type {
  AuthError,
  AuthState,
  Profile,
  UpdateProfileFormValues,
} from "../types/auth.types";

interface AuthContextValue extends AuthState {
  signIn: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ error: AuthError | null }>;
  updateProfile: (
    values: UpdateProfileFormValues
  ) => Promise<{ error: AuthError | null }>;
  uploadAvatar: (file: File) => Promise<{ error: AuthError | null; url?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to fetch profile:", error.message);
    return null;
  }
  return data as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Prevents a stale async profile fetch from a previous user overwriting
  // the state for the current one, e.g. rapid sign-out -> sign-in.
  const activeUserId = useRef<string | null>(null);

  const loadProfileFor = useCallback(async (userId: string) => {
    activeUserId.current = userId;
    const p = await fetchProfile(userId);
    if (activeUserId.current === userId) {
      setProfile(p);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        await loadProfileFor(data.session.user.id);
      }
      if (mounted) setInitializing(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        if (!mounted) return;
        setSession(nextSession);
        if (nextSession?.user) {
          await loadProfileFor(nextSession.user.id);
        } else {
          activeUserId.current = null;
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfileFor]);

  const signIn = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      // Must be set BEFORE signInWithPassword writes the session to storage.
      setRememberMe(rememberMe);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) return { error: normalizeAuthError(error) };
      return { error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` }
    );
    if (error) return { error: normalizeAuthError(error) };
    return { error: null };
  }, []);

  /** Used by the Reset Password page (user arrived via emailed recovery link,
   *  Supabase already gave them a temporary recovery session). */
  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: normalizeAuthError(error) };
    return { error: null };
  }, []);

  /** Used by the Change Password page (user is already fully logged in and
   *  must re-prove their current password before it will be changed). */
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!session?.user?.email) {
        return { error: normalizeAuthError(new Error("session expired")) };
      }
      // Re-authenticate first — Supabase has no dedicated "verify current
      // password" call, so we sign in again with the current credentials.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });
      if (verifyError) {
        return { error: normalizeAuthError(verifyError) };
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: normalizeAuthError(error) };
      return { error: null };
    },
    [session]
  );

  const updateProfile = useCallback(
    async (values: UpdateProfileFormValues) => {
      if (!session?.user?.id) {
        return { error: normalizeAuthError(new Error("session expired")) };
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name.trim(),
          phone: values.phone.trim() || null,
        })
        .eq("id", session.user.id);

      if (error) return { error: normalizeAuthError(error) };
      await loadProfileFor(session.user.id);
      return { error: null };
    },
    [session, loadProfileFor]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!session?.user?.id) {
        return { error: normalizeAuthError(new Error("session expired")) };
      }
      const userId = session.user.id;
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) return { error: normalizeAuthError(uploadError) };

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust so the new photo shows immediately instead of the
      // browser/CDN serving the previous cached image at the same URL.
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) return { error: normalizeAuthError(updateError) };

      await loadProfileFor(userId);
      return { error: null, url: publicUrl };
    },
    [session, loadProfileFor]
  );

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await loadProfileFor(session.user.id);
    }
  }, [session, loadProfileFor]);

  const value: AuthContextValue = {
    initializing,
    userId: session?.user?.id ?? null,
    email: session?.user?.email ?? null,
    profile,
    isAuthenticated: !!session,
    signIn,
    signOut,
    sendPasswordReset,
    updatePassword,
    changePassword,
    updateProfile,
    uploadAvatar,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
           }
    
