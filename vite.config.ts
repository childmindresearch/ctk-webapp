import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vitest/config"
import tailwindcss from "@tailwindcss/vite"
import devtoolsJson from "vite-plugin-devtools-json"
import pkg from "./package.json"

export default defineConfig(({ mode }) => ({
    plugins: [sveltekit(), tailwindcss(), devtoolsJson()],
    assetsInclude: ["**/*.docx"],
    resolve: {
        conditions: mode === "test" ? ["browser"] : []
    },
    define: {
        "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version)
    },
    test: {
        globals: true,
        environment: "jsdom",
        include: ["src/**/*.{test,spec}.{js,ts}"],
        setupFiles: ["src/tests/setup.ts"]
    }
}))
