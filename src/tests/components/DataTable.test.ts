import { render, screen, fireEvent } from "@testing-library/svelte"
import DataTable from "$lib/components/DataTable/DataTable.svelte"
import { vi } from "vitest"

class ResizeObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}

beforeAll(() => {
    Element.prototype.getAnimations = Element.prototype.getAnimations || (() => [])
    Element.prototype.animate =
        Element.prototype.animate ||
        (() => ({
            cancel: () => {},
            finish: () => {},
            play: () => {},
            pause: () => {},
            reverse: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true
        }))
})

global.ResizeObserver = ResizeObserverMock

const mockData = [
    { id: 1, name: "John Doe", age: "30", role: "Developer" },
    { id: 2, name: "Jane Smith", age: "25", role: "Designer" },
    { id: 3, name: "Bob Johnson", age: "35", role: "Manager" }
]

describe("DataTable", () => {
    it("renders table with correct data", async () => {
        render(DataTable, { props: { data: mockData, idColumn: "id" } })

        // Column names take a moment to render.
        await new Promise(r => setTimeout(r, 300))

        expect(screen.getByText("Name")).toBeInTheDocument()
        expect(screen.getByText("Age")).toBeInTheDocument()
        expect(screen.getByText("Role")).toBeInTheDocument()

        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(screen.getByText("30")).toBeInTheDocument()
        expect(screen.getByText("Developer")).toBeInTheDocument()
    })

    it("hides specified columns", async () => {
        const { container } = render(DataTable, {
            props: {
                data: mockData,
                hiddenColumns: ["id"],
                idColumn: "id"
            }
        })

        // Column names take a moment to render.
        await new Promise(r => setTimeout(r, 300))
        const nameHeader = Array.from(container.querySelectorAll("td")).find(td => td.textContent?.includes("Name"))
        const idHeader = Array.from(container.querySelectorAll("td")).find(td => td.textContent?.includes("Id"))

        expect(nameHeader).toBeDefined()
        expect(idHeader).toBeUndefined()
    })

    it("shows edit and delete buttons when handlers are provided", () => {
        const mockEdit = vi.fn()
        const mockDelete = vi.fn()

        render(DataTable, {
            props: {
                data: mockData,
                idColumn: "id",
                onEdit: mockEdit,
                onDelete: mockDelete
            }
        })

        expect(screen.getByText("Controls")).toBeInTheDocument()
        const editButtons = screen.getAllByRole("button", { name: /edit/i })
        const deleteButtons = screen.getAllByRole("button", { name: /delete/i })

        expect(editButtons).toHaveLength(mockData.length)
        expect(deleteButtons).toHaveLength(mockData.length)
    })

    it("calls edit handler with correct row data", async () => {
        const mockEdit = vi.fn()
        render(DataTable, {
            props: {
                data: mockData,
                idColumn: "id",
                onEdit: mockEdit
            }
        })

        const editButtons = screen.getAllByRole("button", { name: /edit/i })
        await fireEvent.click(editButtons[0])

        expect(mockEdit).toHaveBeenCalledWith(mockData[0])
    })

    it("calls delete handler with correct row data", async () => {
        const mockDelete = vi.fn()
        render(DataTable, {
            props: {
                data: mockData,
                idColumn: "id",
                onDelete: mockDelete
            }
        })

        const deleteButtons = screen.getAllByRole("button", { name: "delete" })
        await fireEvent.click(deleteButtons[0])

        expect(mockDelete).toHaveBeenCalledWith(mockData[0])
    })

    it("updates search results when searching", async () => {
        render(DataTable, { props: { data: mockData, idColumn: "id" } })

        const searchInput = screen.getByTestId("search-bar")
        await fireEvent.input(searchInput, { target: { value: "John" } })

        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument()
    })

    it("shows create button when onCreate handler is provided", () => {
        const mockCreate = vi.fn()
        render(DataTable, {
            props: {
                data: mockData,
                idColumn: "id",
                onCreate: mockCreate
            }
        })

        const createButton = screen.getByText("Create")
        expect(createButton).toBeInTheDocument()
    })

    it("sorts columns when clicking header", async () => {
        const { container } = render(DataTable, {
            props: {
                data: mockData,
                idColumn: "id"
            }
        })

        // Table column names take a moment to render.
        await new Promise(r => setTimeout(r, 300))

        // Ascending
        const nameHeaderButton = Array.from(container.querySelectorAll("td"))
            .find(td => td.textContent?.includes("Name"))
            ?.querySelector("button")
        await fireEvent.click(nameHeaderButton!)

        let namesCells = container.querySelectorAll("tbody tr td:nth-child(2)")
        let names = Array.from(namesCells).map(cell => cell.textContent)
        expect(names).toEqual(["Bob Johnson", "Jane Smith", "John Doe"])

        // Descending
        await fireEvent.click(nameHeaderButton!)

        namesCells = container.querySelectorAll("tbody tr td:nth-child(2)")
        names = Array.from(namesCells).map(cell => cell.textContent)

        expect(names).toEqual(["John Doe", "Jane Smith", "Bob Johnson"])
    })
})
