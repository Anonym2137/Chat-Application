import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
})
