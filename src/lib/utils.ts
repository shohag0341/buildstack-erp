import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Bangladesh phone: 01XXXXXXXXX (11 digits, starts with 01) */
export function isValidBdPhone(value: string): boolean {
  return /^01[3-9]\d{8}$/.test(value.trim());
}

/** dd-mm-yyyy — the date format used throughout BuildStack ERP (Bangladesh) */
export function formatBdDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
