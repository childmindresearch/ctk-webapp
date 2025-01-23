import type { PlaywrightTestConfig } from "@playwright/test"

const config: PlaywrightTestConfig = {
    webServer: {
        command: "npm run build && npm run preview",
        port: 4173
    },
    testDir: "./e2e/tests/",
    testMatch: /(.+\.)?(test|spec)\.[jt]s/,
    use: {
        video: "on",
        permissions: ["clipboard-read", "clipboard-write"]
    }
}

export default config
