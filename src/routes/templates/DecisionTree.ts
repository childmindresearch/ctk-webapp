import type { SqlTemplateSchema } from "$lib/server/sql"

export class DecisionTree {
    id: number
    text: string
    parent?: DecisionTree
    children: DecisionTree[]

    constructor(table: SqlTemplateSchema[], rootId?: number, parent?: DecisionTree) {
        let root: SqlTemplateSchema | undefined
        if (rootId === undefined) {
            root = table.find(node => node.parent_id === null)
        } else {
            root = table.find(node => node.id === rootId)
        }

        if (root === undefined) {
            throw new Error("No root node found")
        }
        this.id = root.id
        this.text = root.text
        this.parent = parent
        this.children = table
            .filter(node => node.parent_id === this.id)
            .sort((a, b) => a.priority - b.priority)
            .map(child => new DecisionTree(table, child.id, this))
        this.recursiveSortChildren()
    }

    get priority(): number {
        return this.parent?.children.findIndex(child => child.id === this.id) ?? 0
    }

    getAncestors(): DecisionTree[] {
        const parents: DecisionTree[] = []
        let current: DecisionTree | undefined = this.parent
        while (current) {
            parents.unshift(current)
            current = current.parent
        }
        return parents
    }

    getChildrenRecursive(): DecisionTree[] {
        const children: DecisionTree[] = []
        for (const child of this.children) {
            children.push(child)
            children.push(...child.getChildrenRecursive())
        }
        return children
    }

    filterChildrenByIds(ids: number[]): DecisionTree[] {
        return this.getChildrenRecursive().filter(child => ids.includes(child.id))
    }

    getPath(): string[] {
        const path: string[] = []
        let current: DecisionTree | undefined = this.parent
        while (current) {
            path.unshift(current.text)
            current = current.parent
        }
        return path
    }

    getNodeById(id: number | string): DecisionTree | null {
        if (this.id === id) {
            return this
        }
        for (const child of this.children) {
            const node = child.getNodeById(id)
            if (node) {
                return node
            }
        }
        return null
    }

    addChild(child: DecisionTree, index: number | undefined = undefined) {
        if (index === undefined) {
            index = this.children.length + 1
        }
        child.parent = this
        this.children = [...this.children.slice(0, index), child, ...this.children.slice(index)]
        return this
    }

    deleteChild(id: number) {
        const childIndex = this.children.findIndex(child => child.id === id)
        if (childIndex === -1) {
            return
        }
        this.children.splice(childIndex, 1)
        return this
    }

    moveChild(id: number, newIndex: number) {
        if (newIndex >= this.children.length) return

        const currentIndex = this.children.findIndex(child => child.id === id)
        if (currentIndex === -1 || currentIndex === newIndex) return

        const child = this.children[currentIndex]

        this.deleteChild(id)
        this.addChild(child, newIndex)

        return this
    }

    recursiveSortChildren() {
        this.children = this.children?.sort((a, b) => a.priority - b.priority)
        this.children?.forEach(child => child.recursiveSortChildren())
    }
}
