import { describe, vi } from "vitest"
import { extractAddressComponents, type AmericanAddress } from "$lib/address"

describe.each([
    {
        address: "456 Oak Avenue, Los Angeles, CA 90001",
        expected: { number: "456", suite: null, street: "Oak Avenue", city: "Los Angeles", state: "CA", zip: "90001" }
    },
    {
        address: "789 Pine Street Suite 101, San Francisco, CA 94102",
        expected: {
            number: "789",
            street: "Pine Street",
            suite: "Suite 101",
            city: "San Francisco",
            state: "CA",
            zip: "94102"
        }
    },
    {
        address: "123 Main Street Apt 4B, New York, NY 10001",
        expected: {
            number: "123",
            street: "Main Street",
            suite: "Apt 4B",
            city: "New York",
            state: "NY",
            zip: "10001"
        }
    }
])("extractAddress", ({ address, expected }: { address: string; expected: AmericanAddress }) => {
    const actual = extractAddressComponents(address)
    test("Returns expected address", () => {
        expect(actual).toStrictEqual(expected)
    })
})
