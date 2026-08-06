import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allows previewing from the Codespaces forwarded URL
    port: 5173,
  },
});
