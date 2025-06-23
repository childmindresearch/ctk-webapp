import { test, expect } from "@playwright/test"

test("the user can navigate to the DSM page and copy DSM codes", async ({ page }) => {
    await page.goto("/dsm")
    await page.getByText("Attention-Deficit/Hyperactivity Disorder, Combined presentation").waitFor()

    const selector = page.getByText("Attention-Deficit/Hyperactivity Disorder, Combined presentation")
    await selector.click()
    const copy_button = page.getByTestId("copyButton")
    await copy_button.click()

    const handle = await page.evaluateHandle(() => navigator.clipboard.readText())
    const clipboardContent = await handle.jsonValue()

    expect(clipboardContent).toContain("Attention-Deficit/Hyperactivity Disorder, Combined presentation")
})
