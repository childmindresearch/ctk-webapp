import type { templates } from "$lib/server/db/schema"

export class DecisionTree {
    id: number
    text: string = $state("")
    parent?: DecisionTree = $state(undefined)
    children: DecisionTree[] = $state([])

    constructor(table: (typeof templates.$inferSelect)[], rootId?: number, parent?: DecisionTree) {
        let root: typeof templates.$inferSelect | undefined
        if (rootId === undefined) {
            root = table.find(node => node.parentId === null)
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
            .filter(node => node.parentId === this.id)
            .toSorted((a, b) => a.priority - b.priority)
            .map(child => new DecisionTree(table, child.id, this))
        this.recursiveSortChildren()
    }

    get priority(): number {
        return this.parent?.children.findIndex(child => child.id === this.id) ?? 0
    }

    public getAncestors(): DecisionTree[] {
        const parents: DecisionTree[] = []
        let current: DecisionTree | undefined = this.parent
        while (current) {
            parents.unshift(current)
            current = current.parent
        }
        return parents
    }

    public getChildrenRecursive(): DecisionTree[] {
        const children: DecisionTree[] = []
        for (const child of this.children) {
            children.push(child)
            children.push(...child.getChildrenRecursive())
        }
        return children
    }

    public filterChildrenByIds(ids: number[]): DecisionTree[] {
        return this.getChildrenRecursive().filter(child => ids.includes(child.id))
    }

    public getPath(): string[] {
        const path: string[] = []
        let current: DecisionTree | undefined = this.parent
        while (current) {
            path.unshift(current.text)
            current = current.parent
        }
        return path
    }

    public getNodeById(id: number | string): DecisionTree | null {
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

    public addChild(child: DecisionTree, index: number | undefined = undefined) {
        if (index === undefined) {
            index = this.children.length
        }
        child.parent = this
        this.children.splice(index, 0, child)
        return this
    }

    public deleteChild(id: number) {
        const childIndex = this.children.findIndex(child => child.id === id)
        if (childIndex === -1) {
            return this
        }
        this.children.splice(childIndex, 1)
        return this
    }

    public moveChild(id: number, newIndex: number) {
        if (newIndex >= this.children.length) return this

        const currentIndex = this.children.findIndex(child => child.id === id)
        if (currentIndex === -1 || currentIndex === newIndex) return this

        const child = this.children[currentIndex]

        this.deleteChild(id)
        this.addChild(child, newIndex)

        return this
    }

    private recursiveSortChildren() {
        this.children = this.children?.toSorted((a, b) => a.priority - b.priority)
        this.children?.forEach(child => child.recursiveSortChildren())
    }
}
