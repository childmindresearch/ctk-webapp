import { test, expect } from "@playwright/test"

test("the user can navigate to the DSM page and copy DSM codes", async ({ page }) => {
    await page.goto("/dsm")
    await page.getByText("ADHD, Combined presentation").waitFor()

    const selector = page.getByText("ADHD, Combined presentation")
    await selector.click()
    const copy_button = page.getByTestId("copyButton")
    await copy_button.click()

    const handle = await page.evaluateHandle(() => navigator.clipboard.readText())
    const clipboardContent = await handle.jsonValue()

    expect(clipboardContent).toContain("ADHD, Combined presentation")
})
