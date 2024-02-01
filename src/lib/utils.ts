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

export interface ApiNodeResponse {
  id: number
  text: string
  children: ApiNodeResponse[]
}

export class DecisionTree {
  id: number
  text: string
  parent?: DecisionTree
  children: DecisionTree[]

  constructor(tree: ApiNodeResponse) {
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
}

export function shortenText(str: string, maxLength = 200) {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + "..."
  }
  return str
}
