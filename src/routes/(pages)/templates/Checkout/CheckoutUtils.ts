import type { DecisionTree } from "../DecisionTree.svelte"
import commands, { type TemplateName } from "$lib/shadcn/components/edra/commands/toolbar-commands"

export function getNodeTemplates(node: DecisionTree): TemplateName[] {
    const names = commands.templates.map(c => c.name)
    return names.filter(name => node.text.includes(`data-name="${name}"`))
}
