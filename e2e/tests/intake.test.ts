import { test, expect } from "@playwright/test"

test("the user can navigate to the intake page and request an intake document", async ({ page }) => {
    test.slow()

    await page.goto("/intake")
    page.getByTestId("intakeInput").waitFor()

    const input = page.getByTestId("intakeInput")
    await input.fill("mock")
    const button = page.getByTestId("intakeSubmit")
    await button.click()

    const downloadPromise = page.waitForEvent("download")
    const download = await downloadPromise
    const fileName = download.suggestedFilename()

    expect(fileName).toMatch(/\.docx$/)
})
