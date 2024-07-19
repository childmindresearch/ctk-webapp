<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { downloadBlob } from "$lib/utils"
    import { getToastStore } from "@skeletonlabs/skeleton"
    import type { DecisionTree } from "../DecisionTree"
    import { allUpperCaseDashToCapitalizedSpace, getTemplateValues } from "./templateValueParsing"

    export let nodes: DecisionTree[]

    let isLoading = false
    let values: string[] = []

    const texts = nodes.map(node => `*[${node.parent?.text}]{.underline}*\n\n${node.text}`)
    const templates = texts.map(text => getTemplateValues(text)).flat()
    const uniqueTemplates = templates.filter((value, _, self) => self.find(elem => elem.text === value.text) === value)
    const inputTemplates = uniqueTemplates.filter(value => value.type === "input")
    const containsPronouns = uniqueTemplates.some(value => value.type === "pronoun")
    const containsWarnings = uniqueTemplates.some(value => value.type === "warning")
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
        let markdown = texts.join("\n\n")
        inputTemplates.forEach((template, index) => {
            markdown = markdown.replace(new RegExp(`\{\{${template.text}\}\}`, "g"), values[index])
        })
        pronouns.forEach((pronoun, index) => {
            markdown = markdown.replace(new RegExp(`\{\{PRONOUN-${index}\}\}`, "g"), pronoun)
        })

        fetch("/api/markdown2docx", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Correct-They": pronouns[0] === "they" ? "true" : "false",
                "X-Correct-Capitalization": "true"
            },
            body: markdown
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
</script>

{#if containsWarnings}
    <aside class="alert variant-filled-warning mb-3">
        <div class="alert-message">
            <h3 class="h3">Not all template values covered.</h3>
            <p>Some of the template values will have to be filled in in the Word document.</p>
        </div>
    </aside>
{/if}

<div class="space-y-2">
    <div class="space-x-2">
        {#each inputTemplates as template, index}
            <input
                class="input max-w-60"
                type="text"
                placeholder={allUpperCaseDashToCapitalizedSpace(template.text)}
                bind:value={values[index]}
            />
        {/each}
    </div>
    {#if containsPronouns}
        <p>Please select the patient's pronouns.</p>
        <select class="select max-w-80" bind:value={pronouns}>
            {#each pronounsArray as pronoun}
                <option value={pronoun}>{pronoun.join(", ")}</option>
            {/each}
        </select>
    {/if}

    {#if isLoading}
        <LoadingBar />
    {:else}
        <button class="btn variant-filled-primary" on:click={onSubmit}>Download</button>
    {/if}
</div>
