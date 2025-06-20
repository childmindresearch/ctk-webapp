<script lang="ts">
    import MarkdownEditor from "./MarkdownEditor.svelte"

    type Props = {
        text: string
        title?: string | undefined
        instructions?: string | undefined
        onSubmit: (text: string) => void
    }

    let { text, onSubmit, title = undefined, instructions = undefined }: Props = $props()
    let isLoading = $state(false)
    const startingText = text

    let replacementTags = $derived(detectTags(text, /{{\s*[\w-]+\s*}}/g))
    let warningTags = $derived(detectTags(text, /{{!\s*[\w-]+\s*}}/g))

    function localOnSubmit(event: Event) {
        event.preventDefault()
        isLoading = true
        // Text can take a moment to update, so we'll wait a bit before closing the modal.
        setTimeout(() => {
            onSubmit(text)
        }, 1000)
    }

    function detectTags(text: string, regex: RegExp) {
        const match = text.match(regex)
        if (!match) return []

        function matchToText(tag: string) {
            const text = tag.match(/[0-9a-zA-Z-]+/g)
            if (!text) return ""
            const addSpace = text[0].replace(/-/g, " ")
            const capitalize = addSpace.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase())
            return capitalize
        }

        const tags = match.map(tag => matchToText(tag))
        const uniqueTags = [...new Set(tags)]
        const pronounMapping: { [key: string]: string } = {
            "Pronoun 0": "Pronoun 0 (he/she/they)",
            "Pronoun 1": "Pronoun 1 (him/her/them)",
            "Pronoun 2": "Pronoun 2 (his/her/their)",
            "Pronoun 3": "Pronoun 3 (his/hers/theirs)",
            "Pronoun 4": "Pronoun 4 (himself/herself/themself)"
        }

        return uniqueTags.map(tag => pronounMapping[tag] || tag)
    }
</script>

<div class="card p-4 w-modal-wide shadow-xl space-y-4">
    {#if title}
        <header class="text-2xl">{title}</header>
    {/if}
    {#if instructions}
        <p>{instructions}</p>
    {/if}

    <div>
        <div class="grid grid-cols-2 pb-2">
            <div>
                <h2 class="text-lg">Replacement tags</h2>
                <ol class="list">
                    {#if replacementTags.length > 0}
                        {#each replacementTags as tag}
                            <li>• {tag}</li>
                        {/each}
                    {:else}
                        <li>• No replacement tags found</li>
                    {/if}
                </ol>
            </div>

            <div>
                <h2 class="text-lg">Warning tags</h2>
                <ul>
                    {#if warningTags.length > 0}
                        {#each warningTags as tag}
                            <li>• {tag}</li>
                        {/each}
                    {:else}
                        <li>• No warning tags found</li>
                    {/if}
                </ul>
            </div>
        </div>
        <div>
            <MarkdownEditor value={startingText} on:input={event => (text = event.detail)} />
        </div>
    </div>

    <button disabled={isLoading} class="btn variant-filled-primary" onclick={localOnSubmit}>Save</button>
</div>
