import { cleanup, render } from "@testing-library/svelte"
import LoadingBar from "$lib/components/LoadingBar.svelte"
afterEach(cleanup)

describe("LoadingBar Component", () => {
    test("should render without crashing", () => {
        const { getByTestId } = render(LoadingBar)

        expect(getByTestId("progress-ring")).toBeInTheDocument()
    })

    test("should show progress radial", () => {
        const { getByTestId } = render(LoadingBar)

        expect(getByTestId("progress-ring")).toBeInTheDocument()
    })

    test("should handle undefined value correctly", () => {
        const { getByTestId } = render(LoadingBar)

        console.log(getByTestId("progress-ring"))
        expect(getByTestId("progress-ring")).toHaveAttribute("data-state", "indeterminate")
    })

    test("should display correct value when provided", () => {
        const value = 50
        const { getByTestId } = render(LoadingBar, { value })

        expect(getByTestId("progress-ring")).toHaveAttribute("data-value", value.toString())
    })

    test("should not render label when undefined", () => {
        const { queryByText } = render(LoadingBar)

        expect(queryByText(/.+/)).toBeNull()
    })

    test("should render label when provided", () => {
        const label = "Loading..."
        const { getByText } = render(LoadingBar, { label })

        expect(getByText(label)).toBeInTheDocument()
    })
})
