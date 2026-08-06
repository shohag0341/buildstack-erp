import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useI18n, type TranslationKey } from "../../lib/i18n";
import { forgotPasswordSchema } from "../../lib/validators";
import type { ForgotPasswordFormValues } from "../../types/auth.types";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label, FieldError } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const { sendPasswordReset } = useAuth();
  const [serverError, setServerError] = useState<TranslationKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    setSubmitting(true);
    const { error } = await sendPasswordReset(values.email);
    setSubmitting(false);

    // Deliberately show success even if the account doesn't exist —
    // never reveal which emails are registered (account enumeration).
    if (error && error.code === "network_error") {
      setServerError(error.message as TranslationKey);
      return;
    }
    setSuccess(true);
  };

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.forgot.title")}</CardTitle>
          <CardDescription>{t("auth.forgot.subtitle")}</CardDescription>
        </CardHeader>

        {success ? (
          <Alert variant="success">{t("auth.forgot.success")}</Alert>
        ) : (
          <>
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
              <Button type="submit" className="w-full" isLoading={submitting}>
                {submitting ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
              </Button>
            </form>
          </>
        )}

        <Link
          to="/login"
          className="mt-5 block text-center text-sm font-medium text-[#2C4A6E] hover:underline"
        >
          {t("auth.forgot.backToLogin")}
        </Link>
      </Card>
    </AuthLayout>
  );
}
