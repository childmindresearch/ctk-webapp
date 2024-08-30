import { describe, it, expect } from "vitest"
import { DecisionTree } from "./DecisionTree"
import type { SqlTemplateSchema } from "$lib/server/sql"

describe("DecisionTree", () => {
    const mockData: SqlTemplateSchema[] = [
        { id: 1, text: "Root", parent_id: null, priority: 0 },
        { id: 2, text: "Child 1", parent_id: 1, priority: 0 },
        { id: 3, text: "Child 2", parent_id: 1, priority: 1 },
        { id: 4, text: "Grandchild 1", parent_id: 2, priority: 0 },
        { id: 5, text: "Grandchild 2", parent_id: 2, priority: 1 }
    ]

    it("should construct a tree correctly", () => {
        const tree = new DecisionTree(mockData)

        expect(tree.id).toBe(1)
        expect(tree.text).toBe("Root")
        expect(tree.children.length).toBe(2)
        expect(tree.children[0].id).toBe(2)
        expect(tree.children[1].id).toBe(3)
        expect(tree.children[0].children.length).toBe(2)
    })

    it("should get parents correctly", () => {
        const tree = new DecisionTree(mockData)
        const grandchild = tree.getNodeById(4)

        expect(grandchild).not.toBeNull()
        if (grandchild) {
            const parents = grandchild.getAncestors()
            expect(parents.length).toBe(2)
            expect(parents[0].id).toBe(1)
            expect(parents[1].id).toBe(2)
        }
    })

    it("should get children recursively", () => {
        const tree = new DecisionTree(mockData)
        const children = tree.getChildrenRecursive()

        expect(children.length).toBe(4)
        expect(children.map(c => c.id).sort()).toEqual([2, 3, 4, 5])
    })

    it("should filter children by ids", () => {
        const tree = new DecisionTree(mockData)
        const filtered = tree.filterChildrenByIds([3, 4])

        expect(filtered.length).toBe(2)
        expect(filtered.map(c => c.id).sort()).toEqual([3, 4])
    })

    it("should get path correctly", () => {
        const tree = new DecisionTree(mockData)
        const grandchild = tree.getNodeById(4)

        expect(grandchild).not.toBeNull()

        if (grandchild) {
            const path = grandchild.getPath()
            expect(path).toEqual(["Root", "Child 1"])
        }
    })

    it("should get node by id", () => {
        const tree = new DecisionTree(mockData)
        const node = tree.getNodeById(3)
        expect(node).not.toBeNull()
        expect(node?.id).toBe(3)
        expect(node?.text).toBe("Child 2")
    })

    it("should add child correctly", () => {
        const tree = new DecisionTree(mockData)
        const newChild = new DecisionTree([{ id: 6, text: "New Child", parent_id: 1, priority: 0 }], 6)

        tree.addChild(newChild, 1)

        expect(tree.children.length).toBe(3)
        expect(tree.children[1].id).toBe(6)
        expect(tree.children[1].priority).toBe(1)
        expect(tree.children[2].priority).toBe(2)
    })

    it("should add child at end for index too large", () => {
        const tree = new DecisionTree(mockData)
        const newChild = new DecisionTree([{ id: 6, text: "New Child", parent_id: 1, priority: 0 }], 6)

        tree.addChild(newChild, 99)

        expect(tree.children.length).toBe(3)
        expect(tree.children[2].id).toBe(6)
    })

    it("should delete child correctly", () => {
        const tree = new DecisionTree(mockData)

        tree.deleteChild(2)

        expect(tree.children.length).toBe(1)
        expect(tree.children[0].id).toBe(3)
        expect(tree.children[0].priority).toBe(0)
    })

    it("should move child correctly", () => {
        const tree = new DecisionTree(mockData)

        tree.moveChild(3, 0)

        expect(tree.children[0].id).toBe(3)
        expect(tree.children[0].priority).toBe(0)
        expect(tree.children[1].id).toBe(2)
    })

    it("should sort children recursively", () => {
        const unsortedData: SqlTemplateSchema[] = [
            { id: 1, text: "Root", parent_id: null, priority: 0 },
            { id: 2, text: "Child 1", parent_id: 1, priority: 1 },
            { id: 3, text: "Child 2", parent_id: 1, priority: 0 }
        ]
        const tree = new DecisionTree(unsortedData)
        expect(tree.children[0].id).toBe(3)
        expect(tree.children[1].id).toBe(2)
    })
})
