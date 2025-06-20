import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vitest/config"
import tailwindcss from "@tailwindcss/vite"
import devtoolsJson from "vite-plugin-devtools-json"

export default defineConfig(({ mode }) => ({
    plugins: [sveltekit(), tailwindcss(), devtoolsJson()],
    resolve: {
        conditions: mode === "test" ? ["browser"] : []
    },
    test: {
        globals: true,
        environment: "jsdom",
        include: ["src/**/*.{test,spec}.{js,ts}"],
        setupFiles: ["src/tests/setup.ts"]
    }
}))
