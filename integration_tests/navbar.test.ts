import { expect, test } from "@playwright/test"

test("navbar redirects to templates", async ({ page }) => {
    await page.goto("/summarization")
    const homeLink = page.getByAltText("Clinician Toolkit")
    expect(homeLink).toBeTruthy()

    await homeLink.click()
    await page.waitForURL("/templates")

    expect(page.url()).toMatch(/http:\/\/localhost:[0-9]+\/templates$/)
})
