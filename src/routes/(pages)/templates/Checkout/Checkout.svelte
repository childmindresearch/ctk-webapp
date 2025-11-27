<script lang="ts">
    import { PostTemplatesDownload } from "$api/v1/templates/download"
    import commands, { type TemplateName } from "$lib/components/edra/commands/toolbar-commands"
    import { Button } from "$lib/shadcn/components/ui/button"
    import { Card } from "$lib/shadcn/components/ui/card"
    import { Input } from "$lib/shadcn/components/ui/input"
    import Label from "$lib/shadcn/components/ui/label/label.svelte"
    import * as Select from "$lib/shadcn/components/ui/select"
    import { Spinner } from "$lib/shadcn/components/ui/spinner"
    import { downloadBlob, FetchError } from "$lib/utils"
    import { FileQuestionMark } from "lucide-svelte"
    import { toast } from "svelte-sonner"
    import type { DecisionTree } from "../DecisionTree.svelte"
    import { getNodeTemplates } from "./CheckoutUtils"

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
    let isLoading = $state(false)

    const pronounOptions = [
        { value: "0", pronouns: ["he", "him", "his", "his", "himself"] },
        { value: "1", pronouns: ["she", "her", "her", "hers", "herself"] },
        {
            value: "2",
            pronouns: ["they", "them", "their", "theirs", "themselves"]
        },
        { value: "3", pronouns: ["ze", "zir", "zir", "zirs", "zirself"] }
    ]

    let pronounValue = $state("")
    let pronounTriggerContent = $derived.by(() => {
        const pronounSet = pronounOptions.find(p => p.value === pronounValue)
        return pronounSet === undefined ? "Select pronouns" : pronounSet.pronouns.join(", ")
    })

    function validate(): boolean {
        if (hasPronounTemplate && pronounOptions.find(p => p.value === pronounValue) === undefined) {
            toast.info("Please select pronouns.")
            return false
        }
        if (templateValues.length !== nonPronounTemplates.length || templateValues.some(s => s === "")) {
            toast.info("Please fill out all fields.")
            return false
        }
        return true
    }

    async function downloadText(): Promise<void> {
        if (!validate()) return
        isLoading = true
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
            pronounOptions[parseInt(pronounValue)].pronouns.forEach((pnoun, index) => {
                replacements[`pronoun-${index}` as TemplateName] = pnoun
            })
        }
        const body = {
            templateIds: nodes.map(n => n.id),
            replacements
        }

        try {
            const result = await PostTemplatesDownload.fetch({ body })
            if (result instanceof FetchError) {
                toast.error(`Could not download templates: ${result.message}`)
            } else {
                downloadBlob(result, "ctk_templates.docx")
            }
        } catch (e) {
            console.log(e)
        } finally {
            isLoading = false
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
                        autocomplete="off"
                    />
                </div>
            {/each}
        </div>

        {#if hasPronounTemplate}
            <div class="space-y-2">
                <p class="text-sm font-medium">Please select the patient's pronouns.</p>
                <Select.Root type="single" bind:value={pronounValue}>
                    <Select.Trigger>{pronounTriggerContent}</Select.Trigger>
                    <Select.Content>
                        <Select.Group>
                            <Select.Label>Pronouns</Select.Label>
                            {#each pronounOptions as pronoun (pronoun.value)}
                                <Select.Item value={pronoun.value} label={pronoun.pronouns.join(", ")}>
                                    {pronoun.pronouns.join(", ")}
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
            <Button onclick={downloadText}>Download</Button>
        {/if}
    </div>
{/if}
