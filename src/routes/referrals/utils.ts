export function unpackProviders<T extends Record<string, unknown>>(row: T) {
    return Object.fromEntries(
        Object.entries(row).map(entry => {
            const [key, value] = entry
            if (value instanceof Array) {
                return [key, value.map(v => v.name).join(", ")]
            }
            return [key, String(value)]
        })
    ) as { [K in keyof T]: string }
}
