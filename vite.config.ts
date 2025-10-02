import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "reportingApp",
      filename: "remoteEntry.js",
      exposes: {
        "./ReportingApp": "./src/components/report-view.tsx",
      },
      remotes: {
        storeApp: "https://hipster-store-app.netlify.app/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom", "recharts"],
    }),
  ],
  server: {
    port: 3003,
    strictPort: true,
  },
  preview: {
    port: 3003,
    strictPort: true,
  },
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
