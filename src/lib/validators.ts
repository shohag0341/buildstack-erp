import { z } from "zod";

/** Login only needs a sanity check — the server is the source of truth * for whether the password is actually correct. */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "validation.required")
    .email("validation.email.invalid"),
  password: z.string().min(8, "validation.password.min"),
  rememberMe: z.boolean(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "validation.required")
    .email("validation.email.invalid"),
});

/** Full strength policy — enforced client-side AND mirrored by Supabase's * own password strength setting (configure the same rules in * Supabase Dashboard → Authentication → Policies). */
const strongPassword = z
  .string()
  .min(8, "validation.password.min")
  .regex(/[A-Z]/, "validation.password.uppercase")
  .regex(/[a-z]/, "validation.password.lowercase")
  .regex(/[0-9]/, "validation.password.number")
  .regex(/[^A-Za-z0-9]/, "validation.password.special");

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, "validation.required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "validation.password.mismatch",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "validation.required"),
    newPassword: strongPassword,
    confirmPassword: z.string().min(1, "validation.required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "validation.password.mismatch",
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    message: "error.same_password",
  });

export const updateProfileSchema = z.object({
  full_name: z.string().min(1, "validation.required").max(120),
  phone: z
    .string()
    .refine((val) => val === "" || /^01[3-9]\d{8}$/.test(val), {
      message: "validation.email.invalid",
    }),
});

/** Individual password rule checks, used to render the live checklist * under the password field on Reset/Change Password pages. */
export function getPasswordRuleStatus(password: string) {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
                            }
