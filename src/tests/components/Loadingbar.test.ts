import { cleanup, render } from "@testing-library/svelte"
import LoadingBar from "$lib/components/LoadingBar.svelte"

afterEach(cleanup)

describe("LoadingBar Component", () => {
  test("should render without crashing", () => {
    const { getByTestId } = render(LoadingBar)

    expect(getByTestId("progress-radial")).toBeInTheDocument()
  })

  test("should show progress radial", () => {
    const { getByTestId } = render(LoadingBar)

    expect(getByTestId("progress-radial")).toBeInTheDocument()
  })

  test("should handle undefined value correctly", () => {
    const { getByTestId } = render(LoadingBar)

    expect(getByTestId("progress-radial")).toHaveAttribute("aria-valuetext", "Indeterminate Spinner")
  })

  test("should display correct value when provided", () => {
    const value = 50
    const { getByTestId } = render(LoadingBar, { value })

    expect(getByTestId("progress-radial")).toHaveAttribute("aria-valuenow", value.toString())
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
