import { test, expect } from "@playwright/test"

test("the user can navigate to the templates page and download a template .docx file", async ({ page }) => {
    test.slow()
    await page.goto("/templates")
    await page.locator(".lucide-folder-closed").nth(0).waitFor()

    const folder = page.locator(".lucide-folder-closed").nth(0)
    await folder.click()

    const leaf = page.locator(".lucide-file-plus-2").nth(0)
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
