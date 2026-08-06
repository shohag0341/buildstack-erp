import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2C4A6E", // steel blue — primary
          dark: "#1c3048",
        },
        accent: {
          DEFAULT: "#B4552F", // rebar rust — calls to action
          dark: "#84391e",
        },
        ink: "#1A1F26",
        paper: "#F6F4EF",
      },
      fontFamily: {
        display: ["Space Grotesk", "Hind Siliguri", "sans-serif"],
        sans: ["Hind Siliguri", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
