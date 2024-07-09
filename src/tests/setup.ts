import "@testing-library/jest-dom"

vi.mock("lib/server/sql", async () => {
    return {
        pool: {
            connect: vi.fn().mockResolvedValue({ rows: [] })
        }
    }
})
