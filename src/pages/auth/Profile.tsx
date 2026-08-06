import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { useI18n, type TranslationKey } from "../../lib/i18n";
import { updateProfileSchema } from "../../lib/validators";
import type { UpdateProfileFormValues } from "../../types/auth.types";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label, FieldError } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Alert, Spinner } from "../../components/ui/alert";
import { BackButton } from "../../components/ui/back-button";

const ROLE_LABELS: Record<string, { en: string; bn: string }> = {
  owner: { en: "Owner", bn: "মালিক" },
  manager: { en: "Manager", bn: "ম্যানেজার" },
  accountant: { en: "Accountant", bn: "হিসাবরক্ষক" },
  salesman: { en: "Salesman", bn: "সেলসম্যান" },
  godown_manager: { en: "Godown Manager", bn: "গোডাউন ম্যানেজার" },
};

const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3MB — realistic for a phone upload

export default function ProfilePage() {
  const { t, locale } = useI18n();
  const { profile, updateProfile, uploadAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);
  const [namesLoading, setNamesLoading] = useState(true);

  const [saveError, setSaveError] = useState<TranslationKey | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [avatarError, setAvatarError] = useState<TranslationKey | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { full_name: "", phone: "" },
  });

  useEffect(() => {
    if (profile) {
      reset({ full_name: profile.full_name ?? "", phone: profile.phone ?? "" });
    }
  }, [profile, reset]);

  useEffect(() => {
    let active = true;
    async function loadNames() {
      setNamesLoading(true);
      if (profile?.company_id) {
        const { data } = await supabase
          .from("companies")
          .select("name")
          .eq("id", profile.company_id)
          .single();
        if (active) setCompanyName(data?.name ?? null);
      } else if (active) {
        setCompanyName(null);
      }

      if (profile?.branch_id) {
        const { data } = await supabase
          .from("branches")
          .select("name")
          .eq("id", profile.branch_id)
          .single();
        if (active) setBranchName(data?.name ?? null);
      } else if (active) {
        setBranchName(null);
      }
      if (active) setNamesLoading(false);
    }
    loadNames();
    return () => {
      active = false;
    };
  }, [profile?.company_id, profile?.branch_id]);

  if (!profile) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const onSubmit = async (values: UpdateProfileFormValues) => {
    setSaveError(null);
    setSaveSuccess(false);
    setSaving(true);
    const { error } = await updateProfile(values);
    setSaving(false);
    if (error) {
      setSaveError(error.message as TranslationKey);
      return;
    }
    setSaveSuccess(true);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file next time
    if (!file) return;

    setAvatarError(null);

    if (!file.type.startsWith("image/")) {
      setAvatarError("error.invalid_image_type");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("error.file_too_large");
      return;
    }

    setAvatarUploading(true);
    const { error } = await uploadAvatar(file);
    setAvatarUploading(false);
    if (error) setAvatarError(error.message as TranslationKey);
  };

  const roleLabel = profile.role ? ROLE_LABELS[profile.role]?.[locale] : null;

  
    return (
    <div className="mx-auto w-full max-w-lg p-4">
      <BackButton />
      <Card>
      <CardHeader>
        <CardTitle>{t("auth.profile.title")}</CardTitle>
      </CardHeader>

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#E7E3D8]">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? profile.email}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[#6B6656]">
              {(profile.full_name ?? profile.email).charAt(0).toUpperCase()}
            </div>
          )}
          {avatarUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Spinner className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        <div>
          {!profile.avatar_url && (
            <p className="mb-1.5 text-xs text-[#6B6656]">{t("auth.profile.noPhoto")}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={avatarUploading}
            onClick={handleAvatarClick}
          >
            {avatarUploading ? t("auth.profile.uploading") : t("auth.profile.uploadPhoto")}
          </Button>
          {avatarError && (
            <p className="mt-1.5 text-xs font-medium text-[#C0392B]">{t(avatarError)}</p>
          )}
        </div>
      </div>

      {/* Read-only info */}
      <dl className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-[#E7E3D8] bg-[#FAF8F3] p-4 text-sm">
        <div>
          <dt className="text-[#6B6656]">{t("auth.profile.email")}</dt>
          <dd className="mt-0.5 font-medium text-[#1A1F26]">{profile.email}</dd>
        </div>
        <div>
          <dt className="text-[#6B6656]">{t("auth.profile.role")}</dt>
          <dd className="mt-0.5 font-medium text-[#1A1F26]">{roleLabel ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[#6B6656]">{t("auth.profile.company")}</dt>
          <dd className="mt-0.5 font-medium text-[#1A1F26]">
            {namesLoading ? "…" : companyName ?? t("auth.profile.noCompany")}
          </dd>
        </div>
        <div>
          <dt className="text-[#6B6656]">{t("auth.profile.branch")}</dt>
          <dd className="mt-0.5 font-medium text-[#1A1F26]">
            {namesLoading ? "…" : branchName ?? t("auth.profile.noBranch")}
          </dd>
        </div>
      </dl>

      {saveSuccess && (
        <Alert variant="success" className="mb-5">
          {t("auth.profile.updateSuccess")}
        </Alert>
      )}
      {saveError && (
        <Alert variant="error" className="mb-5">
          {t(saveError)}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="full_name">{t("auth.profile.fullName")}</Label>
          <Input
            id="full_name"
            hasError={!!errors.full_name}
            {...register("full_name")}
          />
          <FieldError>
            {errors.full_name && t(errors.full_name.message as TranslationKey)}
          </FieldError>
        </div>

        <div>
          <Label htmlFor="phone">{t("auth.profile.phone")}</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            placeholder="01XXXXXXXXX"
            hasError={!!errors.phone}
            {...register("phone")}
          />
          <FieldError>{errors.phone && t(errors.phone.message as TranslationKey)}</FieldError>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" isLoading={saving} disabled={!isDirty}>
            {saving ? t("auth.profile.updating") : t("auth.profile.update")}
          </Button>
          <Link to="/change-password">
            <Button type="button" variant="outline">
              {t("auth.profile.changePassword")}
            </Button>
          </Link>
        </div>
      </form>
      </Card>
    </div>
  );
}
      
