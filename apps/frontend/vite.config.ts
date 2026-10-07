/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // reachable from outside the docker container
        port: 4517,
        strictPort: true,
        watch: { usePolling: !!process.env.CHOKIDAR_USEPOLLING },
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test-setup.ts"],
        css: false,
    },
});
