import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

export type Locale = "en" | "bn";

const STORAGE_KEY = "buildstack-erp-locale";

const dict = {
  en: {
    "auth.login.title": "Sign in to BuildStack ERP",
    "auth.login.subtitle": "Manage your trading business from anywhere",
    "auth.login.email": "Email",
    "auth.login.password": "Password",
    "auth.login.rememberMe": "Remember me",
    "auth.login.submit": "Log In",
    "auth.login.submitting": "Signing in…",
    "auth.login.forgotPassword": "Forgot password?",
    "auth.login.noAccount": "Contact your business owner for access",
    "auth.forgot.title": "Reset your password",
    "auth.forgot.subtitle":
      "Enter your email — we'll send you a reset link",
    "auth.forgot.submit": "Send Reset Link",
    "auth.forgot.submitting": "Sending…",
    "auth.forgot.success":
      "If an account exists for this email, a reset link has been sent.",
    "auth.forgot.backToLogin": "Back to Login",
    "auth.reset.title": "Set a new password",
    "auth.reset.newPassword": "New Password",
    "auth.reset.confirmPassword": "Confirm Password",
    "auth.reset.submit": "Update Password",
    "auth.reset.submitting": "Updating…",
    "auth.reset.success": "Password updated. Redirecting to login…",
    "auth.reset.linkExpired":
      "This reset link has expired or was already used. Request a new one.",
    "auth.change.title": "Change Password",
    "auth.change.current": "Current Password",
    "auth.change.new": "New Password",
    "auth.change.confirm": "Confirm New Password",
    "auth.change.submit": "Update Password",
    "auth.change.submitting": "Updating…",
    "auth.change.success": "Your password has been changed.",
    "auth.profile.title": "Profile",
    "auth.profile.fullName": "Full Name",
    "auth.profile.email": "Email",
    "auth.profile.role": "Role",
    "auth.profile.company": "Company",
    "auth.profile.branch": "Branch",
    "auth.profile.phone": "Phone",
    "auth.profile.update": "Update Profile",
    "auth.profile.updating": "Saving…",
    "auth.profile.updateSuccess": "Profile updated successfully.",
    "auth.profile.uploadPhoto": "Upload Photo",
    "auth.profile.uploading": "Uploading…",
    "auth.profile.noCompany": "No company assigned yet",
    "auth.profile.noBranch": "No branch assigned yet",
    "auth.profile.noPhoto": "No profile photo",
    "auth.profile.changePassword": "Change Password",
    "auth.logout": "Log Out",
    "error.invalid_credentials": "Incorrect email or password.",
    "error.user_not_found": "No account found with this email.",
    "error.email_not_confirmed": "Please confirm your email before logging in.",
    "error.network_error": "Network error. Check your internet connection.",
    "error.session_expired": "Your session has expired. Please log in again.",
    "error.reset_link_expired": "This link has expired or was already used.",
    "error.weak_password": "Password does not meet the requirements below.",
    "error.same_password":
      "New password must be different from the current password.",
    "error.rate_limited": "Too many attempts. Please wait and try again.",
    "error.unknown": "Something went wrong. Please try again.",
    "error.invalid_image_type": "Please choose an image file (JPG, PNG, or WEBP).",
    "error.file_too_large": "Image is too large. Please choose a file under 3MB.",
    "validation.required": "This field is required.",
    "validation.email.invalid": "Enter a valid email address.",
    "validation.password.min": "Must be at least 8 characters.",
    "validation.password.uppercase": "Must include an uppercase letter.",
    "validation.password.lowercase": "Must include a lowercase letter.",
    "validation.password.number": "Must include a number.",
    "validation.password.special": "Must include a special character.",
    "validation.password.mismatch": "Passwords do not match.",
    "common.retry": "Retry",
    "common.cancel": "Cancel",
    "common.loading": "Loading…",
    "error403.title": "Access Denied",
    "error403.message":
      "You don't have permission to view this page. Contact your business owner or manager if you think this is a mistake.",
    "error403.backHome": "Go to Dashboard",
  },
  bn: {
    "auth.login.title": "বিল্ডস্ট্যাক ইআরপি-তে লগইন করুন",
    "auth.login.subtitle": "যেকোনো জায়গা থেকে আপনার ব্যবসা পরিচালনা করুন",
    "auth.login.email": "ইমেইল",
    "auth.login.password": "পাসওয়ার্ড",
    "auth.login.rememberMe": "মনে রাখুন",
    "auth.login.submit": "লগইন করুন",
    "auth.login.submitting": "লগইন হচ্ছে…",
    "auth.login.forgotPassword": "পাসওয়ার্ড ভুলে গেছেন?",
    "auth.login.noAccount": "অ্যাক্সেসের জন্য আপনার প্রতিষ্ঠানের মালিকের সাথে যোগাযোগ করুন",
    "auth.forgot.title": "পাসওয়ার্ড রিসেট করুন",
    "auth.forgot.subtitle": "আপনার ইমেইল দিন — আমরা একটি রিসেট লিংক পাঠাবো",
    "auth.forgot.submit": "রিসেট লিংক পাঠান",
    "auth.forgot.submitting": "পাঠানো হচ্ছে…",
    "auth.forgot.success":
      "এই ইমেইলে অ্যাকাউন্ট থাকলে, একটি রিসেট লিংক পাঠানো হয়েছে।",
    "auth.forgot.backToLogin": "লগইনে ফিরে যান",
    "auth.reset.title": "নতুন পাসওয়ার্ড সেট করুন",
    "auth.reset.newPassword": "নতুন পাসওয়ার্ড",
    "auth.reset.confirmPassword": "পাসওয়ার্ড নিশ্চিত করুন",
    "auth.reset.submit": "পাসওয়ার্ড আপডেট করুন",
    "auth.reset.submitting": "আপডেট হচ্ছে…",
    "auth.reset.success": "পাসওয়ার্ড আপডেট হয়েছে। লগইনে পাঠানো হচ্ছে…",
    "auth.reset.linkExpired":
      "এই রিসেট লিংকটি মেয়াদোত্তীর্ণ অথবা ইতিমধ্যে ব্যবহার হয়ে গেছে। নতুন একটি অনুরোধ করুন।",
    "auth.change.title": "পাসওয়ার্ড পরিবর্তন করুন",
    "auth.change.current": "বর্তমান পাসওয়ার্ড",
    "auth.change.new": "নতুন পাসওয়ার্ড",
    "auth.change.confirm": "নতুন পাসওয়ার্ড নিশ্চিত করুন",
    "auth.change.submit": "পাসওয়ার্ড আপডেট করুন",
    "auth.change.submitting": "আপডেট হচ্ছে…",
    "auth.change.success": "আপনার পাসওয়ার্ড পরিবর্তন হয়েছে।",
    "auth.profile.title": "প্রোফাইল",
    "auth.profile.fullName": "পূর্ণ নাম",
    "auth.profile.email": "ইমেইল",
    "auth.profile.role": "ভূমিকা",
    "auth.profile.company": "প্রতিষ্ঠান",
    "auth.profile.branch": "শাখা",
    "auth.profile.phone": "ফোন",
    "auth.profile.update": "প্রোফাইল আপডেট করুন",
    "auth.profile.updating": "সংরক্ষণ হচ্ছে…",
    "auth.profile.updateSuccess": "প্রোফাইল সফলভাবে আপডেট হয়েছে।",
    "auth.profile.uploadPhoto": "ছবি আপলোড করুন",
    "auth.profile.uploading": "আপলোড হচ্ছে…",
    "auth.profile.noCompany": "এখনো কোনো প্রতিষ্ঠান নির্ধারণ করা হয়নি",
    "auth.profile.noBranch": "এখনো কোনো শাখা নির্ধারণ করা হয়নি",
    "auth.profile.noPhoto": "কোনো প্রোফাইল ছবি নেই",
    "auth.profile.changePassword": "পাসওয়ার্ড পরিবর্তন করুন",
    "auth.logout": "লগ আউট",
    "error.invalid_credentials": "ইমেইল অথবা পাসওয়ার্ড ভুল।",
    "error.user_not_found": "এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।",
    "error.email_not_confirmed": "লগইন করার আগে অনুগ্রহ করে ইমেইল নিশ্চিত করুন।",
    "error.network_error": "নেটওয়ার্ক সমস্যা। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।",
    "error.session_expired": "আপনার সেশনের মেয়াদ শেষ হয়ে গেছে। আবার লগইন করুন।",
    "error.reset_link_expired": "এই লিংকের মেয়াদ শেষ অথবা ইতিমধ্যে ব্যবহৃত হয়েছে।",
    "error.weak_password": "পাসওয়ার্ড নিচের শর্তগুলো পূরণ করছে না।",
    "error.same_password": "নতুন পাসওয়ার্ড অবশ্যই বর্তমান পাসওয়ার্ড থেকে ভিন্ন হতে হবে।",
    "error.rate_limited": "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
    "error.unknown": "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।",
    "error.invalid_image_type": "অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন (JPG, PNG, অথবা WEBP)।",
    "error.file_too_large": "ছবিটি অনেক বড়। অনুগ্রহ করে ৩MB এর কম আকারের ফাইল বেছে নিন।",
    "validation.required": "এই ঘরটি পূরণ করা আবশ্যক।",
    "validation.email.invalid": "সঠিক ইমেইল ঠিকানা দিন।",
    "validation.password.min": "কমপক্ষে ৮ অক্ষর হতে হবে।",
    "validation.password.uppercase": "একটি বড় হাতের অক্ষর থাকতে হবে।",
    "validation.password.lowercase": "একটি ছোট হাতের অক্ষর থাকতে হবে।",
    "validation.password.number": "একটি সংখ্যা থাকতে হবে।",
    "validation.password.special": "একটি বিশেষ চিহ্ন থাকতে হবে।",
    "validation.password.mismatch": "পাসওয়ার্ড দুটি মিলছে না।",
    "common.retry": "আবার চেষ্টা করুন",
    "common.cancel": "বাতিল",
    "common.loading": "লোড হচ্ছে…",
    "error403.title": "প্রবেশাধিকার নেই",
    "error403.message":
      "এই পেজটি দেখার অনুমতি আপনার নেই। এটি ভুল মনে হলে আপনার প্রতিষ্ঠানের মালিক বা ম্যানেজারের সাথে যোগাযোগ করুন।",
    "error403.backHome": "ড্যাশবোর্ডে যান",
  },
} as const;

export type TranslationKey = keyof typeof dict.en;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "bn" || saved === "en" ? saved : "bn";
  });

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => dict[locale][key] ?? dict.en[key],
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
    }
