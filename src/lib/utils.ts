export interface ApiTreeNodeResponse {
  id: number
  text: string
  children: ApiTreeNodeResponse[]
}

export class DecisionTree {
  id: number
  text: string
  parent?: DecisionTree
  children: DecisionTree[]
  selected = false

  constructor(tree: ApiTreeNodeResponse) {
    this.id = tree.id
    this.text = tree.text
    this.children = tree.children.map(child => new DecisionTree(child))
    this.children.forEach(child => {
      child.parent = this
    })
  }

  isLeaf(): boolean {
    if (this.children === undefined) {
      throw new Error("Children is undefined")
    }
    return this.children.length === 0
  }

  getDepth(): number {
    let maxDepth = 0
    for (const child of this.children) {
      const depth = child.getDepth()
      if (depth > maxDepth) {
        maxDepth = depth
      }
    }
    return maxDepth + 1
  }

  getSelectedInChildren(): { [key: string]: boolean } {
    const refObject: { [key: string]: boolean } = {}
    this.children.forEach(child => {
      refObject[child.text] = child.selected
    })
    return refObject
  }

  setAllSelected(selected: boolean): void {
    this.selected = selected
    this.children.forEach(child => {
      child.setAllSelected(selected)
    })
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

  getSelection(): DecisionTree {
    let selected: DecisionTree | null = null
    for (const child of this.children) {
      if (child.selected) {
        if (selected) {
          throw new Error("Multiple branches selected")
        }
        selected = child.getSelection()
      }
    }
    if (selected) {
      return selected
    }
    return this
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
}
export type skeletonThemes =
  | "skeleton"
  | "wintry"
  | "modern"
  | "rocket"
  | "seafoam"
  | "vintage"
  | "sahara"
  | "hamlindigo"
  | "gold-nouveau"
  | "crimson"
