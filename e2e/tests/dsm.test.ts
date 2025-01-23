import { test, expect } from "@playwright/test"

test("the user can navigate to the DSM page and copy DSM codes", async ({ page }) => {
    await page.goto("/dsm")
    const cannabis_selector = page.getByText("Severe Cannabis Use Disorder")
    await cannabis_selector.click()
    const copy_button = page.getByTestId("copyButton")
    await copy_button.click()

    const handle = await page.evaluateHandle(() => navigator.clipboard.readText())
    const clipboardContent = await handle.jsonValue()

    expect(clipboardContent).toContain("304.30/F12.20\tSevere Cannabis Use Disorder")
})
