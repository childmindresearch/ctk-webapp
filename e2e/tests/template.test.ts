import { test, expect } from "@playwright/test"

test("the user can navigate to the templates page and download a template .docx file", async ({ page }) => {
    await page.goto("/templates")
    const folder = page.locator(".fa-folder-closed")
    await folder.click()

    const leaf = page.locator(".fa-cart-plus")
    await leaf.click()

    const generationPage = page.getByText("Report Generation")
    await generationPage.click()

    const downloadButton = page.getByText("Download")
    await downloadButton.click()

    const downloadPromise = page.waitForEvent("download")
    const download = await downloadPromise
    const fileName = download.suggestedFilename()

    expect(fileName).toMatch(/\.docx$/)
})
