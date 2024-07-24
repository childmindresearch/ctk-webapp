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
            .map(child => new DecisionTree(table, child.id, this))
    }

    getParents(): DecisionTree[] {
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

    deleteNodeById(id: number): DecisionTree {
        this.children = this.children.filter(child => child.id !== id)
        this.children.forEach(child => child.deleteNodeById(id))
        return this
    }

    recursiveSortChildren() {
        this.children = this.children?.sort((a, b) => a.text.localeCompare(b.text))
        this.children?.forEach(child => child.recursiveSortChildren())
    }
}
