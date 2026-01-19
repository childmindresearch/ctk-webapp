<script lang="ts">
    import { downloadBlob } from "$lib/utils.js"
    import z from "zod"
    import type { PostReferralSchema, ReferralTable } from "$api/v1/referrals/document/schemas"
    import { toast } from "svelte-sonner"

    const { data } = $props()

    let selectedId = $state(data.filterGroups[0].id)

    function formatAddresses(provider: (typeof data.providers)[number]) {
        return provider.addresses
            .map(addr =>
                [addr.addressLine1, addr.addressLine2, addr.city, addr.zipCode, addr.state, addr.contacts]
                    .flat()
                    .filter(Boolean)
                    .join(", ")
            )
            .join("\n\n")
    }

    function formatInsurance(provider: (typeof data.providers)[number]) {
        if (provider.acceptsInsurance) {
            return provider.insuranceDetails ? provider.insuranceDetails : "Yes"
        }
        return "Does not accept insurance."
    }

    async function onDownload() {
        const [fGroup] = data.filterGroups.filter(group => group.id === selectedId)
        const tables = fGroup.filterSets.map(fSet => {
            return {
                title: fSet.name,
                table: data.providers
                    // Remove providers without required service.
                    .filter(provider => {
                        return fSet.services?.includes(provider.service)
                    })
                    // Remove providers without required location(s).
                    .map(provider => {
                        return {
                            ...provider,
                            addresses: provider.addresses.filter(addr => fSet.locations?.includes(addr.location))
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
                            acc.Notes.push(provider.notes)
                            return acc
                        },
                        { Name: [], Addresses: [], Insurance: [], Notes: [] } as z.infer<typeof ReferralTable>
                    )
            }
        })
        const body = { title: fGroup.name, tables } as z.infer<typeof PostReferralSchema>

        await fetch("/api/referrals/document", {
            method: "POST",
            body: JSON.stringify(body)
        }).then(async response => {
            if (!response.ok) {
                toast.error("Could not download document.")
                console.error(await response.text())
                return
            }
            downloadBlob(await response.blob(), "HBN Referrals.docx")
        })
    }
</script>

<div class="gap-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
    <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-2">
            Select Referral Document
            <select class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg" bind:value={selectedId}>
                {#each data.filterGroups as fGroup (fGroup)}
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
