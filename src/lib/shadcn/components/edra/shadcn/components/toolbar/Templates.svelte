<script lang="ts">
    import type { Editor } from "@tiptap/core"
    import * as DropdownMenu from "$lib/shadcn/components/ui/dropdown-menu/index.js"
    import ChevronDown from "@lucide/svelte/icons/chevron-down"
    import commands from "../../../commands/toolbar-commands.js"
    import { cn } from "$lib/utils.js"
    import EdraToolTip from "../EdraToolTip.svelte"
    import { buttonVariants } from "$lib/shadcn/components/ui/button/index.js"
    import { LayoutTemplateIcon } from "@lucide/svelte"

    interface Props {
        editor: Editor
    }

    const { editor }: Props = $props()
    const pronounTemplates = commands["templates"].filter(cmd => cmd.name.startsWith("pronoun"))
    const otherTemplates = commands["templates"].filter(cmd => !cmd.name.startsWith("pronoun"))
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        <EdraToolTip tooltip="Headings">
            <div
                class={buttonVariants({
                    variant: "ghost",
                    class: cn("gap-0")
                })}
            >
                <LayoutTemplateIcon />
                Insert
                <ChevronDown class="text-muted-foreground !size-2" />
            </div>
        </EdraToolTip>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content portalProps={{ to: undefined, disabled: true }}>
        <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Pronouns</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
                {#each pronounTemplates as template (template)}
                    {@const Icon = template.icon}
                    <DropdownMenu.Item onclick={() => template.onClick?.(editor)}>
                        <Icon />
                        <span>{template.tooltip}</span>
                    </DropdownMenu.Item>
                {/each}</DropdownMenu.SubContent
            >
        </DropdownMenu.Sub>
        {#each otherTemplates as template (template)}
            {@const Icon = template.icon}
            <DropdownMenu.Item onclick={() => template.onClick?.(editor)}>
                <Icon />
                <span>{template.tooltip}</span>
            </DropdownMenu.Item>
        {/each}
    </DropdownMenu.Content>
</DropdownMenu.Root>
