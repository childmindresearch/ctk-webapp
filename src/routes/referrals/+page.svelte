<script lang="ts">
    import { downloadBlob, toaster } from "$lib/utils.js"
    import z from "zod"
    import type { PostReferralSchema, ReferralTable } from "$api/referrals/document/schemas"

    const { data } = $props()

    let selectedId = $state(data.filterGroups[0].id)

    function formatAddresses(provider: (typeof data.providers)[number]) {
        return provider.addresses
            .map(addr =>
                [addr.addressLine1, addr.addressLine2, addr.city, addr.zipCode, addr.state, addr.contacts]
                    .flat()
                    .join(", ")
            )
            .join("\n\n")
    }

    function formatInsurance(provider: (typeof data.providers)[number]) {
        return provider.acceptsInsurance ? provider.insuranceDetails : "Does not accept insurance."
    }

    async function onDownload() {
        const [fGroup] = data.filterGroups.filter(group => group.id === selectedId)
        const tables = fGroup.filterSets.map(fSet => {
            return {
                title: fSet.name,
                table: data.providers
                    // Remove providers without required service.
                    .filter(provider => {
                        return fSet.services.map(s => s.id).includes(provider.serviceId)
                    })
                    // Remove providers without required location(s).
                    .map(provider => {
                        return {
                            ...provider,
                            addresses: provider.addresses.filter(addr => fSet.locations.includes(addr.location))
                        }
                    })
                    .filter(provider => {
                        return provider.addresses.length > 0
                    })
                    // Reformat to expected body format.
                    .reduce(
                        (acc, provider) => {
                            acc.Name.push(provider.name)
                            acc.Addresses.push(formatAddresses(provider))
                            acc.Insurance.push(formatInsurance(provider))
                            return acc
                        },
                        { Name: [], Addresses: [], Insurance: [] } as z.infer<typeof ReferralTable>
                    )
            }
        })
        const body = { title: fGroup.name, tables } as z.infer<typeof PostReferralSchema>

        await fetch("/api/referrals/document", {
            method: "POST",
            body: JSON.stringify(body)
        }).then(async response => {
            if (!response.ok) {
                toaster.error({ title: "Could not download document." })
                console.error(await response.text())
                return
            }
            const currentDate = new Date().toISOString().split("T")[0]
            downloadBlob(await response.blob(), `${fGroup.name}_${currentDate}.docx`)
        })
    }
</script>

<div class="gap-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
    <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-2">
            Select Referral Document
            <select class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg" bind:value={selectedId}>
                {#each data.filterGroups as fGroup}
                    <option value={fGroup.id}>
                        {fGroup.name}
                    </option>
                {/each}
            </select>
        </label>
    </div>

    <div class="flex items-end">
        <button class="btn preset-filled-primary-500" onclick={onDownload}> Download </button>
    </div>
</div>
