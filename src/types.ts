export type Parameter = {
  readonly name: string
  readonly type: string
  readonly description: string
  readonly optional: boolean
}

export type StrudelFunction = {
  readonly name: string
  readonly signature: string
  readonly description: string
  readonly parameters: readonly Parameter[]
  readonly examples: readonly string[]
  readonly category: "core" | "effect" | "pattern" | "synth"
}

export type ApiData = readonly StrudelFunction[]

export type MiniNotationElement = {
  readonly name: string
  readonly description: string
  readonly examples: readonly string[]
  readonly category: "note" | "sample" | "operator" | "modifier"
}

export type MiniNotationData = readonly MiniNotationElement[]

export type StringContext = {
  readonly inString: boolean
  readonly stringStart: number
  readonly stringEnd: number
  readonly content: string
  readonly cursorOffset: number
}
