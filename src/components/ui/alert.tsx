import * as React from "react";
import { cn } from "../../lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "info";
}

export function Alert({ className, variant = "info", ...props }: AlertProps) {
  const styles = {
    error: "border-[#F1C4BA] bg-[#FBEEEA] text-[#8C2E1F]",
    success: "border-[#BFE0C9] bg-[#EDF7F0] text-[#215936]",
    info: "border-[#CFDCE9] bg-[#EEF3F8] text-[#1F3A57]",
  }[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm",
        styles,
        className
      )}
      {...props}
    />
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-5 w-5 animate-spin text-[#2C4A6E]", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F4EF]">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
