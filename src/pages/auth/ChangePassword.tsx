import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useI18n, type TranslationKey } from "../../lib/i18n";
import { resetPasswordSchema } from "../../lib/validators";
import type { ResetPasswordFormValues } from "../../types/auth.types";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label, FieldError } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { PasswordRuleChecklist } from "../../components/auth/PasswordRuleChecklist";

type LinkStatus = "checking" | "valid" | "expired";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("checking");
  const [serverError, setServerError] = useState<TranslationKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Supabase fires PASSWORD_RECOVERY once it parses the token from the
  // emailed link's URL fragment. If that never fires and there's also no
  // existing session, the link was already used or has expired.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setLinkStatus("valid");
      }
    });

    const timeout = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      setLinkStatus(data.session ? "valid" : "expired");
    }, 1200);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const password = watch("password", "");

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    setSubmitting(true);
    const { error } = await updatePassword(values.password);
    setSubmitting(false);

    if (error) {
      setServerError(error.message as TranslationKey);
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate("/login", { replace: true }), 1800);
  };

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.reset.title")}</CardTitle>
        </CardHeader>

        {linkStatus === "checking" && (
          <div className="flex justify-center py-6">
            <span className="text-sm text-[#6B6656]">{t("common.loading")}</span>
          </div>
        )}

        {linkStatus === "expired" && (
          <Alert variant="error">{t("auth.reset.linkExpired")}</Alert>
        )}

        {linkStatus === "valid" && success && (
          <Alert variant="success">{t("auth.reset.success")}</Alert>
        )}

        {linkStatus === "valid" && !success && (
          <>
            {serverError && (
              <Alert variant="error" className="mb-5">
                {t(serverError)}
              </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <Label htmlFor="password">{t("auth.reset.newPassword")}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  hasError={!!errors.password}
                  {...register("password")}
                />
                <PasswordRuleChecklist password={password} />
                <FieldError>
                  {errors.password && t(errors.password.message as TranslationKey)}
                </FieldError>
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t("auth.reset.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  hasError={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                <FieldError>
                  {errors.confirmPassword &&
                    t(errors.confirmPassword.message as TranslationKey)}
                </FieldError>
              </div>

              <Button type="submit" className="w-full" isLoading={submitting}>
                {submitting ? t("auth.reset.submitting") : t("auth.reset.submit")}
              </Button>
            </form>
          </>
        )}
      </Card>
    </AuthLayout>
  );
      }
