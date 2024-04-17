<script lang="ts">
    import { getModalStore } from "@skeletonlabs/skeleton"
    import MarkdownEditor from "./MarkdownEditor.svelte"

    const modalStore = getModalStore()
    let text = $modalStore[0].meta.value

    function onSubmit(event: Event) {
        event.preventDefault()
        if ($modalStore[0].response) {
            $modalStore[0].response({ value: text })
        }
        modalStore.close()
    }
</script>

{#if $modalStore[0]}
    <div class="card p-4 w-modal-wide shadow-xl space-y-4">
        {#if $modalStore[0].title}
            <header class="text-2xl">{$modalStore[0].title}</header>
        {/if}
        {#if $modalStore[0].meta.instructions}
            <p>{$modalStore[0].meta.instructions}</p>
        {/if}
        <article>
            <MarkdownEditor value={$modalStore[0].meta.value} on:input={event => (text = event.detail)} />
        </article>
        <button class="btn variant-filled-primary" on:click={onSubmit}>Save</button>
    </div>
{/if}
