import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-lg border bg-white px-3.5 text-base text-[#1A1F26]",
          "placeholder:text-[#9B9686] focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          hasError
            ? "border-[#C0392B] focus-visible:ring-[#C0392B]"
            : "border-[#D8D3C8] focus-visible:ring-[#2C4A6E]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
