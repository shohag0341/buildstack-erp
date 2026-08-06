import { Link } from "react-router-dom";
import { useI18n } from "../../lib/i18n";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/button";

export default function UnauthorizedPage() {
  const { t } = useI18n();
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F4EF] px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FBEEEA] text-3xl">
        🚧
      </div>
      <h1 className="font-display text-2xl font-bold text-[#1A1F26]">
        {t("error403.title")}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[#6B6656]">{t("error403.message")}</p>
      <div className="mt-6 flex gap-3">
        <Link to="/dashboard">
          <Button>{t("error403.backHome")}</Button>
        </Link>
        <Button variant="outline" onClick={() => void signOut()}>
          {t("auth.logout")}
        </Button>
      </div>
    </div>
  );
}
