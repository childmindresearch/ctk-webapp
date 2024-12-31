<script lang="ts">
    import type { ExtendedProvider } from "$lib/server/types.js"
    import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton"

    let { data } = $props()

    let loading = false
    const toastStore = getToastStore()

    async function onSubmit(event: Event) {
        console.log(event)
        const id = 1
        const providers = (await (await fetch(`/api/referrals/providers/presets/${id}`)).json()) as ExtendedProvider[]
        console.log(providers)
        if (providers.length === 0) return

        loading = true
        const columns: (keyof (typeof providers)[number])[] = Object.keys(providers[0])
        let markdown = "| " + columns.join(" | ") + " |\n"
        markdown += "| " + Array(columns.length).fill("------").join(" | ") + " |\n"
        providers.forEach(row => {
            markdown += "| " + columns.map(col => row[col]).join(" | ") + " |\n"
        })

        let markdown2docxForm = new FormData()
        markdown2docxForm.append("markdown", markdown)

        await fetch("/api/markdown2docx", {
            method: "POST",
            body: markdown2docxForm
        })
            .then(async response => {
                if (response.ok) {
                    const blob = await response.blob()
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "referrals.docx"
                    a.click()
                    URL.revokeObjectURL(url)
                    loading = false
                    return
                }
                const toast: ToastSettings = {
                    message: "There was a problem connecting to the server.",
                    background: "variant-filled-error"
                }
                toastStore.trigger(toast)
                loading = false
                return
            })
            .catch(error => {
                const toast: ToastSettings = {
                    message: `There was a interpreting the server response: ${error}.`,
                    background: "variant-filled-error"
                }
                toastStore.trigger(toast)
                loading = false
                return
            })
    }
</script>

<form onsubmit={onSubmit}>
    <select>
        {#each data.presets as preset}
            <option value={preset}>
                {preset.name}
            </option>
        {/each}
    </select>
    <button class="btn" type="submit"> Export </button>
</form>
