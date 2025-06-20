<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { toaster } from "$lib/utils"
    import type { DecisionTree } from "../DecisionTree.svelte"
    import { allUpperCaseDashToCapitalizedSpace, getTemplateValues, submitMarkdownToDocx } from "./checkoutUtilities"

    type Props = {
        nodes: DecisionTree[]
    }
    let { nodes }: Props = $props()

    let isLoading = $state(false)
    let values: string[] = []

    // A custom LUA filter in the backend converts ++{}++ to underlined. Commonmark does not support underlining.
    const texts = nodes.map(node => `*++${node.parent?.text}++*\n\n${node.text}`)
    const templates = texts.map(text => getTemplateValues(text)).flat()
    const uniqueTemplates = templates.filter((value, _, self) => self.find(elem => elem.text === value.text) === value)
    const inputTemplates = uniqueTemplates.filter(value => value.type === "input")
    const containsPronouns = uniqueTemplates.some(value => value.type === "pronoun")
    const containsWarnings = uniqueTemplates.some(value => value.type === "warning")

    const pronounsArray = [
        ["he", "him", "his", "his", "himself"],
        ["she", "her", "her", "hers", "herself"],
        ["they", "them", "their", "theirs", "themselves"],
        ["ze", "zir", "zir", "zirs", "zirself"]
    ]

    let pronouns: string[] = $state(pronounsArray[0])

    async function onSubmit(event: Event) {
        event.preventDefault()
        if (values.some(value => value === "")) {
            toaster.error({ title: "Please fill all the fields." })
            return
        }

        isLoading = true
        let markdown = texts.join("  \n&nbsp;  \n\n") // Adds an "empty" line between each template
        const rules = ["BASE_FORM", "PERS_PRONOUN_AGREEMENT", "NON3PRS_VERB", "UPPERCASE_SENTENCE_START"]
        inputTemplates.forEach((template, index) => {
            markdown = markdown.replace(new RegExp(`\{\{${template.text}\}\}`, "g"), values[index])
        })
        pronouns.forEach((pronoun, index) => {
            markdown = markdown.replace(new RegExp(`\{\{PRONOUN-${index}\}\}`, "g"), pronoun)
        })

        try {
            await submitMarkdownToDocx(markdown, rules)
        } finally {
            isLoading = false
        }
    }
</script>

{#if containsWarnings}
    <aside class="alert preset-filled-warning-500 mb-3">
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
        <button class="btn preset-filled-primary-500" onclick={onSubmit}>Download</button>
    {/if}
</div>
