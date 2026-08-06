import { useI18n } from "../../lib/i18n";
import { getPasswordRuleStatus } from "../../lib/validators";
import { cn } from "../../lib/utils";

export function PasswordRuleChecklist({ password }: { password: string }) {
  const { t } = useI18n();
  const status = getPasswordRuleStatus(password);

  const rules: Array<{ key: keyof typeof status; label: string }> = [
    { key: "minLength", label: t("validation.password.min") },
    { key: "uppercase", label: t("validation.password.uppercase") },
    { key: "lowercase", label: t("validation.password.lowercase") },
    { key: "number", label: t("validation.password.number") },
    { key: "special", label: t("validation.password.special") },
  ];

  return (
    <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
      {rules.map((rule) => (
        <li
          key={rule.key}
          className={cn(
            "flex items-center gap-1.5 text-xs",
            status[rule.key] ? "text-[#215936]" : "text-[#8A8470]"
          )}
        >
          <span
            className={cn(
              "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px]",
              status[rule.key] ? "bg-[#3F7A52] text-white" : "bg-[#E7E3D8] text-transparent"
            )}
          >
            ✓
          </span>
          {rule.label}
        </li>
      ))}
    </ul>
  );
}
