<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { downloadBlob } from "$lib/utils"
    import { getToastStore } from "@skeletonlabs/skeleton"
    import type { DecisionTree } from "./DecisionTree"

    export let nodes: DecisionTree[]

    let templates = getTemplateText(nodes)
    let stringTemplates = templates.filter(template => !template.includes("PRONOUN"))
    let values = Array(stringTemplates.length).fill("")
    let isLoading = false
    let containsPronouns = templates.some(template => template.includes("PRONOUN"))

    const toastStore = getToastStore()
    const pronounsArray = [
        ["he", "him", "his", "his", "himself"],
        ["she", "her", "her", "hers", "herself"],
        ["they", "them", "their", "theirs", "themselves"],
        ["ze", "zir", "zir", "zirs", "zirself"]
    ]

    let pronouns: string[] = pronounsArray[0]

    function onSubmit(event: Event) {
        event.preventDefault()
        if (values.some(value => value === "")) {
            toastStore.trigger({ message: "Please fill all the fields.", background: "variant-filled-error" })
            return
        }

        isLoading = true
        let text = nodes.map(node => node.text).join("\n\n")
        stringTemplates.forEach((template, index) => {
            text = text.replace(new RegExp(`\{\{${template}\}\}`, "g"), values[index])
        })
        pronouns.forEach((pronoun, index) => {
            text = text.replace(new RegExp(`\{\{PRONOUN_${index}\}\}`, "g"), pronoun)
        })

        fetch("/api/markdown2docx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: text
        })
            .then(async res => {
                if (!res.ok) {
                    throw new Error(await res.text())
                }
                return await res.blob()
            })
            .then(blob => {
                const filename = "templates.docx"
                downloadBlob(blob, filename)
                isLoading = false
            })
            .catch(error => {
                toastStore.trigger({ message: error.message, background: "variant-filled-error" })
                isLoading = false
            })
    }

    function allUpperCaseUnderscoreToCapitalizedSpace(input: string): string {
        return input
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ")
    }

    function getTemplateText(nodes: DecisionTree[]): string[] {
        const templates = new Set<string>()
        nodes.forEach(node => {
            const matches = node.text.match(/{{(.*?)}}/g)
            if (!matches) return
            matches.forEach(match => {
                const template = match.replace(/{{|}}/g, "").trim()
                templates.add(template)
            })
        })
        return Array.from(templates)
    }
</script>

<div class="space-y-2">
    {#if stringTemplates.length === 0}
        <p class="text-center">No fields required.</p>
    {:else}
        <p class="text-center">Please fill in the following fields:</p>
    {/if}
    <div class="space-x-2">
        {#each stringTemplates as template, index}
            <input
                class="input max-w-60"
                type="text"
                placeholder={allUpperCaseUnderscoreToCapitalizedSpace(template)}
                bind:value={values[index]}
            />
        {/each}
    </div>
    {#if containsPronouns}
        <p class="text-center">Please select the correct pronouns.</p>
        <div class="space-x-2">
            <select class="select" bind:value={pronouns}>
                {#each pronounsArray as pronoun}
                    <option value={pronoun}>{pronoun.join(", ")}</option>
                {/each}
            </select>
        </div>
    {/if}
    <button class="btn variant-filled-primary" on:click={onSubmit}>Download</button>
    {#if isLoading}
        <LoadingBar />
    {/if}
</div>
