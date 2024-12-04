import { render, screen, fireEvent } from "@testing-library/svelte"
import DataTable from "$lib/components/DataTable/DataTable.svelte"
import { vi } from "vitest"

class ResizeObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}

global.ResizeObserver = ResizeObserverMock

const mockData = [
    { id: 1, name: "John Doe", age: 30, role: "Developer" },
    { id: 2, name: "Jane Smith", age: 25, role: "Designer" },
    { id: 3, name: "Bob Johnson", age: 35, role: "Manager" }
]

describe("DataTable", () => {
    it("renders table with correct data", async () => {
        render(DataTable, { props: { data: mockData } })

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
                hiddenColumns: ["id"]
            }
        })

        // Column names take a moment to render.
        await new Promise(r => setTimeout(r, 300))
        const headers = container.querySelectorAll("th")
        const idHeader = Array.from(headers).find(th => th.textContent?.includes("Id"))
        expect(idHeader).toHaveClass("hidden")
    })

    it("calls onExport with correct data", async () => {
        const mockExport = vi.fn()
        render(DataTable, {
            props: {
                data: mockData,
                onExport: mockExport
            }
        })

        const exportButton = screen.getByText("Export")
        await fireEvent.click(exportButton)

        expect(mockExport).toHaveBeenCalledWith(mockData)
    })

    it("shows edit and delete buttons when handlers are provided", () => {
        const mockEdit = vi.fn()
        const mockDelete = vi.fn()

        render(DataTable, {
            props: {
                data: mockData,
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
                onDelete: mockDelete
            }
        })

        const deleteButtons = screen.getAllByRole("button", { name: "delete" })
        await fireEvent.click(deleteButtons[0])

        expect(mockDelete).toHaveBeenCalledWith(mockData[0])
    })

    it("updates search results when searching", async () => {
        render(DataTable, { props: { data: mockData } })

        const searchInput = screen.getByPlaceholderText("Search")
        await fireEvent.input(searchInput, { target: { value: "John" } })

        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument()
    })

    it("shows create button when onCreate handler is provided", () => {
        const mockCreate = vi.fn()
        render(DataTable, {
            props: {
                data: mockData,
                onCreate: mockCreate
            }
        })

        const createButton = screen.getByText("Create")
        expect(createButton).toBeInTheDocument()
    })

    it("shows correct pagination information", () => {
        render(DataTable, { props: { data: mockData } })

        expect(screen.getByText(/Showing 1 to 3 of 3 rows/)).toBeInTheDocument()
    })

    it("sorts columns when clicking header", async () => {
        const { container } = render(DataTable, {
            props: {
                data: mockData
            }
        })

        // Table column names take a moment to render.
        await new Promise(r => setTimeout(r, 300))

        // Ascending
        const nameHeader = Array.from(container.querySelectorAll("th")).find(th => th.textContent?.includes("Name"))
        await fireEvent.click(nameHeader!)

        let namesCells = container.querySelectorAll("tbody tr td:nth-child(2)")
        let names = Array.from(namesCells).map(cell => cell.textContent)
        expect(names).toEqual(["Bob Johnson", "Jane Smith", "John Doe"])

        // Descending
        await fireEvent.click(nameHeader!)

        namesCells = container.querySelectorAll("tbody tr td:nth-child(2)")
        names = Array.from(namesCells).map(cell => cell.textContent)

        expect(names).toEqual(["John Doe", "Jane Smith", "Bob Johnson"])
    })
})
