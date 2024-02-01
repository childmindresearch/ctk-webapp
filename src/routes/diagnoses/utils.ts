import type { DecisionTree } from "$lib/utils"

export function getTemplateText(nodes: DecisionTree[]): string[] {
  const templates = new Set<string>()
  nodes.forEach(node => {
    const matches = node.text.match(/{{(.*?)}}/g)
    if (!matches) return
    matches.forEach(match => {
      const template = match.replace(/{{|}}/g, "").trim()
      templates.add(allUpperCaseUnderscoreToCapitalizedSpace(template))
    })
  })
  return Array.from(templates)
}

export function getNodePath(node: DecisionTree): string[] {
  return node.getPath().slice(1)
}

function allUpperCaseUnderscoreToCapitalizedSpace(input: string): string {
  return input
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}
