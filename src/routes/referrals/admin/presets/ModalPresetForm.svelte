<script lang="ts">
    import { getModalStore } from "@skeletonlabs/skeleton"
    import MultiSelect from "../MultiSelect.svelte"

    const modalStore = getModalStore()

    let name: string = $state($modalStore[0].meta?.name ?? "")

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
