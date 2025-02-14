export type AmericanAddress = {
    number: string | null // Not int to account for apartment numbers like 916-1570.
    suite: string | null
    street: string | null
    city: string | null
    state: string | null
    zip: string | null
}

export function extractAddressComponents(address: string): AmericanAddress {
    const numberRegex = RegExp("^[0-9]+-?[0-9]+")
    const suiteRegex = RegExp("(Apt|Suite) (#)?[0-9]+[A-Za-z]?")
    const streetRegex = RegExp(`[a-zA-Z][a-zA-Z ]+`, "i")
    const stateRegex = RegExp("[A-Za-z]{2}")
    const zipRegex = RegExp("[0-9]{5}(-[0-9]{4})?")

    const suiteLine = matchFirstOrNull(address.split(",")[0].trim(), suiteRegex)
    if (suiteLine) {
        address = address.replace(suiteLine, "")
    }

    return {
        number: matchFirstOrNull(address.split(",")[0].trim(), numberRegex),
        suite: suiteLine,
        street: matchFirstOrNull(address.split(",")[0].trim(), streetRegex),
        city: address.split(",")[1].trim(),
        state: matchFirstOrNull(address.split(",")[2].trim(), stateRegex),
        zip: matchFirstOrNull(address.split(",")[2].trim(), zipRegex)
    }
}

function matchFirstOrNull(str: string, regex: RegExp) {
    const result = regex.exec(str)
    if (!result) return null
    return result[0]
}
