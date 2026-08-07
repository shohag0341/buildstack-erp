import { useNavigate } from "react-router-dom";
import { useI18n } from "../../lib/i18n";

export function BackButton() {
  const navigate = useNavigate();
  const { locale } = useI18n();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#6B6656] hover:text-[#1A1F26]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {locale === "bn" ? "ফিরে যান" : "Back"}
    </button>
  );
}
