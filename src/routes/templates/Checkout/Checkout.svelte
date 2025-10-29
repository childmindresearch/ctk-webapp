<script lang="ts">
    import { FileQuestionMark } from "lucide-svelte"
    import type { DecisionTree } from "../DecisionTree.svelte"
    import { Button } from "$lib/components/ui/button"
    import { Input } from "$lib/components/ui/input"
    import * as Select from "$lib/components/ui/select"
    import { Card } from "$lib/components/ui/card"
    import { getNodeTemplates, nodes2Docx } from "./CheckoutUtils"
    import commands, { type TemplateName } from "$lib/components/edra/commands/toolbar-commands"
    import Label from "$lib/components/ui/label/label.svelte"
    import { Packer } from "docx"
    import { downloadBlob } from "$lib/utils"

    type Props = {
        nodes: DecisionTree[]
    }

    let { nodes }: Props = $props()
    let templates = $derived([...new Set(nodes.flatMap(getNodeTemplates))])
    let hasPronounTemplate = $derived(templates.find(t => t.startsWith("pronoun")) !== undefined)
    let nonPronounTemplates = $derived(
        commands.templates.filter(t => !t.name.startsWith("pronoun")).filter(t => templates.includes(t.name))
    )
    let templateValues: string[] = $state([])

    const pronounsArray = [
        { value: "0", pronouns: ["he", "him", "his", "his", "himself"] },
        { value: "1", pronouns: ["she", "her", "her", "hers", "herself"] },
        {
            value: "2",
            pronouns: ["they", "them", "their", "theirs", "themselves"]
        },
        { value: "3", pronouns: ["ze", "zir", "zir", "zirs", "zirself"] }
    ]

    let selectedPronounValue = $state("0")

    async function downloadText() {
        let replacements = nonPronounTemplates
            .map(t => t.name)
            .reduce(
                (acc, curr, index) => {
                    acc[curr as TemplateName] = templateValues[index]
                    return acc
                },
                {} as Record<TemplateName, string>
            )
        if (hasPronounTemplate) {
            pronounsArray[parseInt(selectedPronounValue)].pronouns.forEach((pnoun, index) => {
                replacements[`pronoun-${index}` as TemplateName] = pnoun
            })
        }

        try {
            const docx = await nodes2Docx(nodes, replacements)
            Packer.toBlob(docx).then(blob => {
                downloadBlob(blob, "ctk_templates.docx")
            })
        } catch (e) {
            console.log(e)
        }
    }
</script>

{#if nodes.length === 0}
    <Card class="p-8">
        <div class="flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileQuestionMark class="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 class="text-lg font-semibold mb-2">No Templates Selected</h3>
            <p class="text-muted-foreground">Add templates from the Templates List to export.</p>
        </div>
    </Card>
{:else}
    <div class="space-y-4">
        <div class="flex flex-wrap gap-2">
            {#each nonPronounTemplates as template, index (template)}
                <div class="space-y-2">
                    <Label for={template.name}>{template.tooltip}</Label>
                    <Input
                        id={template.name}
                        class="max-w-60"
                        type="text"
                        placeholder={template.tooltip}
                        bind:value={templateValues[index]}
                    />
                </div>
            {/each}
        </div>

        {#if hasPronounTemplate}
            <div class="space-y-2">
                <p class="text-sm font-medium">Please select the patient's pronouns.</p>
                <Select.Root type="single" bind:value={selectedPronounValue}>
                    <Select.Trigger class="max-w-80">Select Pronouns</Select.Trigger>
                    <Select.Content>
                        <Select.Group>
                            <Select.Label>Pronouns</Select.Label>
                            {#each pronounsArray as pronoun (pronoun.value)}
                                <Select.Item value={pronoun.value} label={pronoun.pronouns.join(", ")} />
                            {/each}
                        </Select.Group>
                    </Select.Content>
                </Select.Root>
            </div>
        {/if}
        <Button onclick={downloadText}>Download</Button>
    </div>
{/if}
