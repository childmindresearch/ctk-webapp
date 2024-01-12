export class DiagnosisNode {
  text: string
  path: string[]
  id: number

  constructor(text: string, path: string[], id: number) {
    this.text = text
    this.path = path
    this.id = id
  }

  pathString(): string {
    return this.path.join(" > ")
  }
}
