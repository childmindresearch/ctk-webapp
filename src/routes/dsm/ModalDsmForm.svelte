<script lang="ts">
    import { getModalStore } from "@skeletonlabs/skeleton"

    const modalStore = getModalStore()
    let code: string = $modalStore[0].meta.code
    let label: string = $modalStore[0].meta.label

    function onSubmit(event: Event) {
        event.preventDefault()

        if ($modalStore[0].response) {
            $modalStore[0].response({ code: code, label: label })
            modalStore.close()
        }
    }
</script>

{#if $modalStore[0]}
    <div class="card p-4 w-modal-wide shadow-xl space-y-4">
        <form on:submit={onSubmit}>
            <label>
                DSM Code
                <input class="input" bind:value={code} />
            </label>
            <label>
                DSM Label
                <input class="input" bind:value={label} />
            </label>
            <button class="btn variant-filled-primary" type="submit"> Submit </button>
        </form>
    </div>
{/if}
