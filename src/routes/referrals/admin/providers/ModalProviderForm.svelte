<script lang="ts">
    import { getModalStore } from "@skeletonlabs/skeleton"
    import MultiSelect from "../MultiSelect.svelte"

    const modalStore = getModalStore()

    let name: string = $state($modalStore[0].meta?.name ?? "")
    let address: string = $state($modalStore[0].meta?.address ?? "")
    let phone: string = $state($modalStore[0].meta?.phone ?? "")
    let website: string = $state($modalStore[0].meta?.website ?? "")
    let takesInsurance: boolean = $state($modalStore[0].meta?.takesInsurance ?? false)
    let description: string = $state($modalStore[0].meta?.description ?? "")

    const multiSelectKeys = ["Languages", "Services"] as const
    const multiSelects: Record<(typeof multiSelectKeys)[number], string> = {
        Languages: "/api/referrals/languages",
        Services: "/api/referrals/services",
    }
    const idsSelected: Record<(typeof multiSelectKeys)[number], { id: number; name: string }[]> = {
        Languages: $modalStore[0].meta?.languages ?? [],
        Services: $modalStore[0].meta?.services ?? [],
    }

    function onSubmit() {
        if ($modalStore[0].response) {
            $modalStore[0].response({
                name,
                address,
                phone,
                website,
                takesInsurance,
                description,
                languages: idsSelected.Languages,
                services: idsSelected.Services,
            })
            modalStore.close()
        }
    }
</script>

{#if $modalStore[0]}
    <div class="card fixed p-12 rounded-3xl w-modal-wide space-y-4 max-h-[70vh] overflow-y-auto">
        <form onsubmit={onSubmit}>
            <label>
                Name
                <input class="input" required bind:value={name} />
            </label>
            <label>
                Address
                <input class="input" required bind:value={address} />
            </label>
            <label>
                Phone
                <input class="input" required bind:value={phone} />
            </label>

            <label class="label">
                <span>Website</span>
                <input class="input" bind:value={website} placeholder="https://" />
            </label>

            <label class="label flex items-center space-x-2">
                <input type="checkbox" class="checkbox" bind:checked={takesInsurance} />
                <span>Takes Insurance</span>
            </label>

            <label class="label">
                <span>Description</span>
                <textarea class="textarea" rows="3" bind:value={description} placeholder="Enter description..."
                ></textarea>
            </label>

            {#each multiSelectKeys as name}
                <MultiSelect
                    {name}
                    endpoint={multiSelects[name]}
                    isSelected={idsSelected[name].map(selection => selection.name)}
                    onSelect={selection => (idsSelected[name] = selection)}
                />
            {/each}

            <button class="btn variant-filled-primary" type="submit"> Submit </button>
        </form>
    </div>
{/if}
