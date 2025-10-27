<script lang="ts">
    import { TriangleAlert } from "lucide-svelte"
    import type { DecisionTree } from "../DecisionTree.svelte"
    import { allUpperCaseDashToCapitalizedSpace, getTemplateValues, submitMarkdownToDocx } from "./checkoutUtilities"
    import { toast } from "svelte-sonner"
    import { Spinner } from "$lib/components/ui/spinner"
    import { Button } from "$lib/components/ui/button"
    import { Input } from "$lib/components/ui/input"
    import * as Select from "$lib/components/ui/select"
    import * as Alert from "$lib/components/ui/alert"

    type Props = {
        nodes: DecisionTree[]
    }

    let { nodes }: Props = $props()
    let isLoading = $state(false)
    let values: string[] = $state([])

    // A custom LUA filter in the backend converts ++{}++ to underlined. Commonmark does not support underlining.
    const texts = nodes.map(node => `*++${node.parent?.text}++*\n\n${node.text}`)
    const templates = texts.map(text => getTemplateValues(text)).flat()
    const uniqueTemplates = templates.filter((value, _, self) => self.find(elem => elem.text === value.text) === value)
    const inputTemplates = uniqueTemplates.filter(value => value.type === "input")
    const containsPronouns = uniqueTemplates.some(value => value.type === "pronoun")
    const containsWarnings = uniqueTemplates.some(value => value.type === "warning")

    const pronounsArray = [
        { value: "0", label: "he, him, his, his, himself", pronouns: ["he", "him", "his", "his", "himself"] },
        { value: "1", label: "she, her, her, hers, herself", pronouns: ["she", "her", "her", "hers", "herself"] },
        {
            value: "2",
            label: "they, them, their, theirs, themselves",
            pronouns: ["they", "them", "their", "theirs", "themselves"]
        },
        { value: "3", label: "ze, zir, zir, zirs, zirself", pronouns: ["ze", "zir", "zir", "zirs", "zirself"] }
    ]

    let selectedPronounValue = $state("0")
    let pronouns = $derived(
        pronounsArray.find(p => p.value === selectedPronounValue)?.pronouns ?? pronounsArray[0].pronouns
    )
    let triggerContent = $derived(pronounsArray.find(p => p.value === selectedPronounValue)?.label ?? "Select pronouns")

    async function onSubmit(event: Event) {
        event.preventDefault()
        if (values.some(value => value === "")) {
            toast.error("Please fill all the fields.")
            return
        }
        isLoading = true
        let markdown = texts.join("  \n&nbsp;  \n\n") // Adds an "empty" line between each template
        const rules = ["BASE_FORM", "PERS_PRONOUN_AGREEMENT", "NON3PRS_VERB", "UPPERCASE_SENTENCE_START"]

        inputTemplates.forEach((template, index) => {
            markdown = markdown.replace(new RegExp(`\\{\\{${template.text}\\}\\}`, "g"), values[index])
        })
        pronouns.forEach((pronoun, index) => {
            markdown = markdown.replace(new RegExp(`\\{\\{PRONOUN-${index}\\}\\}`, "g"), pronoun)
        })

        try {
            await submitMarkdownToDocx(markdown, rules)
        } finally {
            isLoading = false
        }
    }
</script>

{#if containsWarnings}
    <Alert.Root variant="destructive" class="mb-4">
        <TriangleAlert class="h-4 w-4" />
        <Alert.Title>Not all template values covered.</Alert.Title>
        <Alert.Description
            >Some of the template values will have to be filled in in the Word document.</Alert.Description
        >
    </Alert.Root>
{/if}

<div class="space-y-4">
    <div class="flex flex-wrap gap-2">
        {#each inputTemplates as template, index (template.text)}
            <Input
                class="max-w-60"
                type="text"
                placeholder={allUpperCaseDashToCapitalizedSpace(template.text)}
                bind:value={values[index]}
            />
        {/each}
    </div>

    {#if containsPronouns}
        <div class="space-y-2">
            <p class="text-sm font-medium">Please select the patient's pronouns.</p>
            <Select.Root type="single" bind:value={selectedPronounValue}>
                <Select.Trigger class="max-w-80">
                    {triggerContent}
                </Select.Trigger>
                <Select.Content>
                    <Select.Group>
                        <Select.Label>Pronouns</Select.Label>
                        {#each pronounsArray as pronoun (pronoun.value)}
                            <Select.Item value={pronoun.value} label={pronoun.label}>
                                {pronoun.label}
                            </Select.Item>
                        {/each}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
        </div>
    {/if}

    {#if isLoading}
        <Spinner />
    {:else}
        <Button onclick={onSubmit}>Download</Button>
    {/if}
</div>
