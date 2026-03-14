import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const PORT = env.VITE_PORT ?? 5173;
    return {
        plugins: [react(), tailwindcss()],
        server: {
            port: Number(PORT),
            strictPort: true,
        },
        preview: {
            port: 5678,
        },
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
        define: {
            "process.env": {
                VITE_ENDPOINT: env.VITE_ENDPOINT,
            },
        },
    };
});
