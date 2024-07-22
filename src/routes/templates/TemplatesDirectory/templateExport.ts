import { giveMarkdownUrlsHyperlinks } from "$lib/utils"
import type { DecisionTree } from "../DecisionTree"

export function nodesToMarkdown(node: DecisionTree, depth: number = 0): string {
    const isLeaf = !node.children || node.children.length === 0
    let header = ""
    if (!isLeaf) {
        header = "#".repeat(depth + 1) + " "
    }
    const text = giveMarkdownUrlsHyperlinks(node.text)
    return header + `${text}\n` + node.children.map(child => nodesToMarkdown(child, depth + 1)).join("\n")
}
