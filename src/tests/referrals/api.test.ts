import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { GET as getProviders, POST as postProvider } from "../../routes/api/referrals/providers/+server.ts"
import { GET as getFilterGroups, POST as postFilterGroup } from "../../routes/api/referrals/filter-groups/+server.ts"
import { POST as postDocument } from "../../routes/api/referrals/document/+server.ts"

vi.mock("$lib/server/db", () => ({
    db: {
        transaction: vi.fn(async cb => await cb({}))
    }
}))

vi.mock("$api/referrals/crud.js", () => ({
    getProviders: vi.fn(async () => mockProviders),
    getFilterGroups: vi.fn(async () => mockFilterGroups)
}))

const mockProviders = [
    {
        id: 1,
        name: "Provider A",
        acceptsInsurance: true,
        insuranceDetails: "details",
        serviceId: 1,
        service: { id: 1, name: "Service" },
        addresses: [],
        subServices: [],
        notes: ""
    }
]

const mockFilterGroups = [
    {
        id: 1,
        name: "Group 1",
        filterSets: []
    }
]

describe("referrals api", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("GET providers returns list", async () => {
        const response = await getProviders()
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data).toEqual(mockProviders)
    })

    it("POST provider returns created provider", async () => {
        const body = JSON.stringify({
            name: "Provider A",
            acceptsInsurance: true,
            insuranceDetails: "details",
            minAge: 0,
            maxAge: 99,
            service: "Service",
            subServices: [],
            addresses: [{ location: "Loc", locationType: "in-person", contacts: [] }],
            notes: ""
        })
        const dbMock = { transaction: vi.fn(async () => 1) }
        vi.mocked((await import("$lib/server/db")).db).transaction = dbMock.transaction
        const crud = await import("$api/referrals/crud.js")
        vi.mocked(crud.getProviders).mockResolvedValue(mockProviders)
        const response = await postProvider({ request: new Request("http://test", { method: "POST", body }) })
        expect(dbMock.transaction).toHaveBeenCalled()
        expect(response.status).toBe(201)
        expect(await response.json()).toEqual(mockProviders)
    })

    it("GET filter groups", async () => {
        const response = await getFilterGroups()
        const data = await response.json()
        expect(data).toEqual(mockFilterGroups)
    })

    it("POST filter group", async () => {
        const body = JSON.stringify({ name: "Group 1", filterSets: [] })
        const dbMock = { transaction: vi.fn(async () => 1) }
        vi.mocked((await import("$lib/server/db")).db).transaction = dbMock.transaction
        const crud = await import("$api/referrals/crud.js")
        vi.mocked(crud.getFilterGroups).mockResolvedValue(mockFilterGroups)
        const response = await postFilterGroup({ request: new Request("http://test", { method: "POST", body }) })
        expect(dbMock.transaction).toHaveBeenCalled()
        expect(response.status).toBe(201)
        expect(await response.json()).toEqual(mockFilterGroups[0])
    })

    it("POST document proxies to azure", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response("ok"))
        const event = { fetch: fetchMock, request: new Request("http://test", { method: "POST", body: "{}" }) }
        const envMod = await import("$lib/server/environment")
        envMod.AZURE_FUNCTION_PYTHON_URL = "http://azure"
        const res = await postDocument(event as any)
        expect(fetchMock).toHaveBeenCalled()
        expect(fetchMock.mock.calls[0][0]).toBe("http://azure/referral")
        expect(res.status).toBe(200)
    })
})
