<script lang="ts">
    import DataTable from "$lib/components/DataTable/DataTable.svelte"
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import type { ExtendedProvider } from "$lib/server/types"
    import { unpackProviders } from "../../utils.js"

    let { data } = $props()
    let selected = $state(data.presets[0])
    let providerPromise: Promise<ExtendedProvider[]> = $derived(getProviders(selected.id))

    async function getProviders(presetId: number) {
        return await (await fetch(`/api/referrals/providers/presets/${presetId}`)).json()
    }
</script>

<select class="select" bind:value={selected}>
    {#each data.presets as preset}
        <option value={preset}>
            {preset.name}
        </option>
    {/each}
</select>

{#await providerPromise}
    <LoadingBar />
{:then providers}
    <DataTable data={providers} unpack={unpackProviders} />
{/await}
