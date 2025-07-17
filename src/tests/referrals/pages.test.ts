import { render, fireEvent } from "@testing-library/svelte"
import ReferralsPage from "../../routes/referrals/+page.svelte"
import AdminProvidersPage from "../../routes/referrals/admin/providers/+page.svelte"
import AdminFilterGroupsPage from "../../routes/referrals/admin/filter-groups/+page.svelte"

describe("Referrals Pages", () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })
    test("referrals page renders filter groups and download triggers API", async () => {
        const data = {
            providers: [
                {
                    id: 1,
                    name: "Provider A",
                    acceptsInsurance: true,
                    insuranceDetails: "details",
                    serviceId: 1,
                    service: { id: 1, name: "Service" },
                    addresses: [
                        {
                            id: 1,
                            providerId: 1,
                            location: "Loc",
                            locationType: "in-person",
                            addressLine1: "123 St",
                            addressLine2: null,
                            city: "City",
                            state: "ST",
                            zipCode: "00000",
                            contacts: []
                        }
                    ],
                    subServices: [],
                    notes: ""
                }
            ],
            filterGroups: [
                {
                    id: 10,
                    name: "Group 1",
                    filterSets: [
                        {
                            id: 1,
                            name: "Set 1",
                            locations: ["Loc"],
                            services: [{ id: 1, service: { id: 1, name: "Service" } }]
                        }
                    ]
                }
            ]
        }
        const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
        global.fetch = fetchMock as any
        const { getByText } = render(ReferralsPage, { data })
        await fireEvent.click(getByText("Download"))
        expect(fetchMock).toHaveBeenCalled()
        expect(fetchMock.mock.calls[0][0]).toContain("/api/referrals/document")
    })

    test("providers admin page shows provider name", () => {
        const data = {
            providers: [
                {
                    id: 1,
                    name: "Provider A",
                    acceptsInsurance: true,
                    insuranceDetails: "details",
                    minAge: 0,
                    maxAge: 99,
                    service: { id: 1, name: "Service" },
                    subServices: [],
                    addresses: [],
                    notes: "",
                    serviceId: 1
                }
            ]
        }
        const { getByText } = render(AdminProvidersPage, { data })
        expect(getByText("Provider A")).toBeInTheDocument()
    })

    test("filter groups admin page displays group name", () => {
        const data = {
            providers: [],
            filterGroups: [
                {
                    id: 1,
                    name: "Group 1",
                    filterSets: []
                }
            ]
        }
        const { getByText } = render(AdminFilterGroupsPage, { data })
        expect(getByText("Group 1")).toBeInTheDocument()
    })
})
