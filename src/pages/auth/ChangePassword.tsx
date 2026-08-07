import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import { useI18n, type TranslationKey } from "../../lib/i18n";
import { changePasswordSchema } from "../../lib/validators";
import type { ChangePasswordFormValues } from "../../types/auth.types";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label, FieldError } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { PasswordRuleChecklist } from "../../components/auth/PasswordRuleChecklist";
import { BackButton } from "../../components/ui/back-button";

export default function ChangePasswordPage() {
  const { t } = useI18n();
  const { changePassword } = useAuth();
  const [serverError, setServerError] = useState<TranslationKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword", "");

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setServerError(null);
    setSuccess(false);
    setSubmitting(true);
    const { error } = await changePassword(values.currentPassword, values.newPassword);
    setSubmitting(false);

    if (error) {
      setServerError(error.message as TranslationKey);
      return;
    }
    setSuccess(true);
    reset();
  };

  return (
    <div className="mx-auto w-full max-w-md p-4">
      <BackButton />
      <Card>
      <CardHeader>
        <CardTitle>{t("auth.change.title")}</CardTitle>
      </CardHeader>

      {success && (
        <Alert variant="success" className="mb-5">
          {t("auth.change.success")}
        </Alert>
      )}
      {serverError && (
        <Alert variant="error" className="mb-5">
          {t(serverError)}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="currentPassword">{t("auth.change.current")}</Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            hasError={!!errors.currentPassword}
            {...register("currentPassword")}
          />
          <FieldError>
            {errors.currentPassword && t(errors.currentPassword.message as TranslationKey)}
          </FieldError>
        </div>

        <div>
          <Label htmlFor="newPassword">{t("auth.change.new")}</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            hasError={!!errors.newPassword}
            {...register("newPassword")}
          />
          <PasswordRuleChecklist password={newPassword} />
          <FieldError>
            {errors.newPassword && t(errors.newPassword.message as TranslationKey)}
          </FieldError>
        </div>

        <div>
          <Label htmlFor="confirmPassword">{t("auth.change.confirm")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            hasError={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError>
            {errors.confirmPassword && t(errors.confirmPassword.message as TranslationKey)}
          </FieldError>
        </div>

        <Button type="submit" isLoading={submitting}>
          {submitting ? t("auth.change.submitting") : t("auth.change.submit")}
        </Button>
      </form>
      </Card>
    </div>
  );
      }
