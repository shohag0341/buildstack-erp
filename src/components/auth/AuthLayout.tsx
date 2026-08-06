import type { ReactNode } from "react";
import { useI18n } from "../../lib/i18n";

export function AuthLayout({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F4EF]">
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2C4A6E] font-display text-sm font-bold text-white">
            B
          </div>
          <span className="font-display text-sm font-semibold tracking-tight text-[#1A1F26]">
            BuildStack ERP
          </span>
        </div>
        <button
          type="button"
          onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
          className="rounded-md border border-[#D8D3C8] px-3 py-1.5 text-xs font-medium text-[#1A1F26] hover:bg-[#EFEBE0]"
        >
          {locale === "bn" ? "English" : "বাংলা"}
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
