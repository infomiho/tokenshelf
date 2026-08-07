import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: [
      "@base-ui/react/alert-dialog",
      "@phosphor-icons/react/dist/csr/DotsThreeVertical",
      "@phosphor-icons/react/dist/csr/PencilSimple",
    ],
  },
});
