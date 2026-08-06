import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useI18n, type TranslationKey } from "../../lib/i18n";
import { loginSchema } from "../../lib/validators";
import type { LoginFormValues } from "../../types/auth.types";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label, FieldError } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<TranslationKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    setSubmitting(true);
    const { error } = await signIn(values.email, values.password, values.rememberMe);
    setSubmitting(false);

    if (error) {
      setServerError(error.message as TranslationKey);
      return;
    }

    const state = location.state as LocationState | null;
    const redirectTo = state?.from?.pathname ?? "/dashboard";
    navigate(redirectTo, { replace: true });
  };

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.login.title")}</CardTitle>
          <CardDescription>{t("auth.login.subtitle")}</CardDescription>
        </CardHeader>

        {serverError && (
          <Alert variant="error" className="mb-5">
            {t(serverError)}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="email">{t("auth.login.email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              hasError={!!errors.email}
              {...register("email")}
            />
            <FieldError>
              {errors.email && t(errors.email.message as TranslationKey)}
            </FieldError>
          </div>

          <div>
            <Label htmlFor="password">{t("auth.login.password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              hasError={!!errors.password}
              {...register("password")}
            />
            <FieldError>
              {errors.password && t(errors.password.message as TranslationKey)}
            </FieldError>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[#1A1F26]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#D8D3C8] text-[#2C4A6E]"
                {...register("rememberMe")}
              />
              {t("auth.login.rememberMe")}
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-[#2C4A6E] hover:underline"
            >
              {t("auth.login.forgotPassword")}
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={submitting}
            aria-label={submitting ? t("auth.login.submitting") : t("auth.login.submit")}
          >
            {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
        </form>
      </Card>

      <p className="mt-5 text-center text-xs text-[#6B6656]">
        {t("auth.login.noAccount")}
      </p>
    </AuthLayout>
  );
                                    }

