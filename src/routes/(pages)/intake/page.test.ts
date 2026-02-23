import { render, screen, waitFor, fireEvent } from "@testing-library/svelte"
import { describe, it, expect, vi } from "vitest"
import IntakeReportPage from "./+page.svelte"
import { GetIntakeDownload } from "$api/v1/intake-report/[id]/download"

vi.mock("$api/v1/intake-report/[id]/download", () => ({
    GetIntakeDownload: {
        fetch: vi.fn()
    }
}))

describe("Intake Page", () => {
    it("displays the loading state for the entire duration of the fetch promise", async () => {
        let resolveFetch
        const controlledPromise = new Promise(resolve => {
            resolveFetch = resolve
        })

        // @ts-expect-error mocked value is unused so correct type is not needed.
        vi.mocked(GetIntakeDownload).fetch.mockReturnValue(controlledPromise)

        render(IntakeReportPage)

        const input = screen.getByTestId("intakeInput")

        await fireEvent.input(input, { target: { value: "MRN-12345" } })
        const submitButton = screen.getByTestId("intakeSubmit")
        await fireEvent.click(submitButton)

        expect(screen.queryByTestId("div-spinner")).toBeInTheDocument()
        // Ensure the loading bar doesn't immediately disappear.
        await new Promise(r => setTimeout(r, 50))
        expect(screen.queryByTestId("div-spinner")).toBeInTheDocument()

        const mockBlob = new Blob(["dummy"])
        // @ts-expect-error resolveFetch is guaranteed to be defined as controlledPromise is called on button click.
        await resolveFetch(mockBlob)
        await waitFor(() => {
            expect(screen.queryByTestId("div-spinner")).not.toBeInTheDocument()
        })
    })
})
