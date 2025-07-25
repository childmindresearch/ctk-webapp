import { test, expect } from "@playwright/test"

const baseURL = process.env.BASE_URL || "http://localhost:4173"

const providersUrl = `${baseURL}/api/referrals/providers`

const sampleProvider = {
    name: "Integration Test Provider" + Date.now() + Math.random().toString(36).substring(2, 15),
    acceptsInsurance: false,
    insuranceDetails: "None",
    minAge: 1,
    maxAge: 99,
    notes: "",
    service: "Mental Health",
    subServices: ["Individual Therapy"],
    addresses: [
        {
            location: "Test Location",
            locationType: "in-person",
            addressLine1: "123 Test St",
            city: "Testville",
            state: "TS",
            zipCode: "00000",
            contacts: ["555-5555"]
        }
    ]
}

function createFilterGroup() {
    return {
        name: "Test Filter Group " + Date.now() + Math.random().toString(36).substring(2, 15),
        filterSets: [
            {
                name: "Test Filter Set " + Date.now() + Math.random().toString(36).substring(2, 15),
                services: ["Service A", "Service B"],
                locations: ["Test Location 1", "Test Location 2"]
            }
        ]
    }
}

test.describe("referrals providers API", () => {
    test("list providers", async ({ request }) => {
        const res = await request.get(providersUrl)
        expect(res.ok()).toBeTruthy()
        const data = await res.json()
        expect(Array.isArray(data)).toBeTruthy()
        expect(data.length).toBeGreaterThan(0)
    })

    test("create, fetch and delete provider", async ({ request }) => {
        const create = await request.post(providersUrl, { data: sampleProvider })
        expect(create.ok()).toBeTruthy()
        const [created] = await create.json()
        expect(created.name).toBe(sampleProvider.name)

        const id = created.id
        const fetchedRes = await request.get(`${providersUrl}/${id}`)
        expect(fetchedRes.ok()).toBeTruthy()
        const fetched = await fetchedRes.json()
        expect(fetched.id).toBe(id)
        expect(fetched.addresses.length).toBe(1)

        const delRes = await request.delete(`${providersUrl}/${id}`)
        expect(delRes.ok()).toBeTruthy()
    })

    test("modify provider", async ({ request }) => {
        const create = await request.post(providersUrl, { data: sampleProvider })
        expect(create.ok()).toBeTruthy()
        const [created] = await create.json()
        expect(created.name).toBe(sampleProvider.name)

        const id = created.id
        const updatedData = { ...sampleProvider, name: "Updated Provider Name" }
        const updateRes = await request.put(`${providersUrl}/${id}`, { data: updatedData })
        expect(updateRes.ok()).toBeTruthy()
        const updated = await updateRes.json()
        expect(updated.name).toBe("Updated Provider Name")

        const delRes = await request.delete(`${providersUrl}/${id}`)
        expect(delRes.ok()).toBeTruthy()
    })
})

test.describe("referrals filter groups API", () => {
    test("list filter groups", async ({ request }) => {
        const res = await request.get(`${baseURL}/api/referrals/filter-groups`)
        expect(res.ok()).toBeTruthy()
        const data = await res.json()
        expect(Array.isArray(data)).toBeTruthy()
        expect(data.length).toBeGreaterThan(0)
    })

    test("create, fetch and delete filter group", async ({ request }) => {
        const sampleFilterGroup = createFilterGroup()
        const create = await request.post(`${baseURL}/api/referrals/filter-groups`, { data: sampleFilterGroup })
        expect(create.ok()).toBeTruthy()
        const created = await create.json()
        expect(created.name).toBe(sampleFilterGroup.name)

        const id = created.id
        const fetchedRes = await request.get(`${baseURL}/api/referrals/filter-groups/${id}`)
        expect(fetchedRes.ok()).toBeTruthy()
        const fetched = await fetchedRes.json()
        expect(fetched.id).toBe(id)
        expect(fetched.filterSets.length).toBe(1)

        const delRes = await request.delete(`${baseURL}/api/referrals/filter-groups/${id}`)
        expect(delRes.ok()).toBeTruthy()
    })

    test("modify filter group", async ({ request }) => {
        const sampleFilterGroup = createFilterGroup()
        const create = await request.post(`${baseURL}/api/referrals/filter-groups`, { data: sampleFilterGroup })
        expect(create.ok()).toBeTruthy()
        const created = await create.json()
        expect(created.name).toBe(sampleFilterGroup.name)

        const id = created.id
        const updatedData = { ...sampleFilterGroup, name: "Updated Filter Group Name" }
        const updateRes = await request.put(`${baseURL}/api/referrals/filter-groups/${id}`, { data: updatedData })
        expect(updateRes.ok()).toBeTruthy()
        const updated = await updateRes.json()
        expect(updated.name).toBe("Updated Filter Group Name")

        const delRes = await request.delete(`${baseURL}/api/referrals/filter-groups/${id}`)
        expect(delRes.ok()).toBeTruthy()
    })
})
