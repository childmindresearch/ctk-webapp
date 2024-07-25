import { giveMarkdownUrlsHyperlinks } from "$lib/utils"
import type { DecisionTree } from "../DecisionTree"

export function nodesToMarkdown(node: DecisionTree, depth: number = 0): string {
    const isLeaf = !node.children || node.children.length === 0
    let header = ""
    if (!isLeaf) {
        header = "#".repeat(depth + 1) + " "
    }
    const text = giveMarkdownUrlsHyperlinks(node.text)
    const full_text = header + `${text}\n` + node.children.map(child => nodesToMarkdown(child, depth + 1)).join("\n")

    // Pandoc does not support tabs. We use |t as a workaround.
    return full_text.replace(/\t/g, "|t")
}
