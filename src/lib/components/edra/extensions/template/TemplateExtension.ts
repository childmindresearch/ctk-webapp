import { mergeAttributes } from "@tiptap/core"
import type { Node as PMNode } from "@tiptap/pm/model"
import { Node } from "@tiptap/core"
import type { EditorView } from "@tiptap/pm/view"

const TEXT_COLOR = "#0369A1"
const BACKGROUND_COLOR = "#E0F2FE"
const BORDER_COLOR = "#7DD3FC"
const TEMPLATE_CSS = `
    background-color: ${BACKGROUND_COLOR};
    color: ${TEXT_COLOR};
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid ${BORDER_COLOR};
    white-space: nowrap;
`
    .replace(/\s+/g, " ")
    .trim()

export interface TemplateOptions {
    HTMLAttributes: Record<string, unknown>
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        template: {
            /**
             * Set a Template node
             */
            setTemplate: (name: string, options: string[]) => ReturnType
            /**
             * Remove a Template
             */
            removeTemplate: () => ReturnType
        }
    }
}

class TemplateNodeView {
    dom: HTMLElement
    node: PMNode
    view: EditorView
    getPos: () => number | undefined

    constructor(node: PMNode, view: EditorView, getPos: () => number | undefined) {
        this.node = node
        this.getPos = getPos
        this.view = view

        this.dom = document.createElement("span")
        this.dom.setAttribute("data-template", "")
        this.dom.setAttribute("data-extension-type", "template")
        this.dom.setAttribute("data-name", node.attrs.name || "")
        this.dom.setAttribute("data-options", JSON.stringify(node.attrs.options || []))
        this.render(view)
    }

    private isAtSentenceStart(view: EditorView): boolean {
        const pos = this.getPos()
        if (pos === undefined) return false
        if (pos === 0) return true
        const { doc } = view.state
        const lookBackDistance = Math.min(pos, 20)
        const textBefore = doc.textBetween(Math.max(0, pos - lookBackDistance), pos).trim()

        if (textBefore.length === 0) return true
        const lastChar = textBefore[textBefore.length - 1]
        return [".", "!", "?", "\n"].includes(lastChar)
    }

    private capitalizeFirst(text: string): string {
        if (!text || text.length === 0) return text
        return text.charAt(0).toUpperCase() + text.slice(1)
    }

    render(view: EditorView) {
        let options = this.node.attrs.options || []
        if (this.isAtSentenceStart(view)) {
            options = options.map(this.capitalizeFirst)
        }
        const displayText = options.join(", ")

        this.dom.textContent = displayText
        this.dom.style.cssText = TEMPLATE_CSS
    }
}

export const TemplateExtension = Node.create<TemplateOptions>({
    name: "template",
    group: "inline",
    inline: true,
    draggable: true,
    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {},
            suggestedVariables: []
        }
    },

    addAttributes() {
        return {
            name: {
                default: this.name,
                parseHTML: el => (el as HTMLSpanElement).getAttribute("data-name"),
                renderHTML: attrs => ({ "data-name": attrs.name })
            },
            options: {
                default: [],
                parseHTML: el => {
                    const optionsStr = (el as HTMLSpanElement).getAttribute("data-options")
                    return optionsStr ? JSON.parse(optionsStr) : []
                },
                renderHTML: attrs => ({
                    "data-options": JSON.stringify(attrs.options)
                })
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: "span[data-template]",
                getAttrs: element => {
                    const optionsStr = element.getAttribute("data-options")
                    return {
                        name: element.getAttribute("data-name"),
                        options: optionsStr ? JSON.parse(optionsStr) : []
                    }
                }
            }
        ]
    },

    renderHTML({ HTMLAttributes }) {
        const displayText = JSON.parse(HTMLAttributes["data-options"]).join(", ")
        return [
            "span",
            mergeAttributes(
                this.options.HTMLAttributes,
                {
                    "data-template": "",
                    "data-extension-type": "template",
                    "data-name": this.name,
                    "data-options": this.options,
                    style: TEMPLATE_CSS
                },
                HTMLAttributes
            ),
            displayText
        ]
    },

    addNodeView() {
        return ({ node, view, getPos }) => {
            return new TemplateNodeView(node, view, getPos)
        }
    },

    addCommands() {
        return {
            setTemplate:
                (name: string, options: string[]) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: {
                            name,
                            options
                        }
                    })
                },

            removeTemplate:
                () =>
                ({ commands, state }) => {
                    const { selection } = state
                    const { $from } = selection

                    const node = $from.parent

                    if (node.type.name === this.name) {
                        return commands.deleteNode(this.name)
                    }

                    return false
                }
        }
    }
})
