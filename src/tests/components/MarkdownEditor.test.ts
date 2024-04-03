import { render, cleanup } from "@testing-library/svelte"
import MarkdownEditor from "$lib/components/MarkdownEditor.svelte"

afterEach(cleanup)

describe("MarkdownEditor", () => {
    test("renders without crashing", () => {
        const { container } = render(MarkdownEditor)
        expect(container).toBeInTheDocument()
    })

    test("shows LoadingBar initially", async () => {
        const { getByText } = render(MarkdownEditor)

        expect(getByText("Loading editor...")).toBeInTheDocument()
    })

    test("generates unique UUID for each instance", () => {
        const { getAllByTestId } = render(MarkdownEditor)
        render(MarkdownEditor)

        const divs = getAllByTestId("vditor-div")

        expect(divs[0].id).not.toEqual(divs[1].id)
        expect(divs.length).toEqual(2)
    })
})
