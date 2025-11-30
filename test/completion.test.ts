import { describe, expect, it } from "vitest"
import { CompletionItemKind } from "vscode-languageserver"
import {
  filterByPrefix,
  getCompletions,
  getWordAtPosition,
  toCompletionItem,
  toCompletionItems,
} from "../src/services/completion.service.js"
import type { ApiData, StrudelFunction } from "../src/types.js"

const mockApiData: ApiData = [
  {
    name: "lpf",
    signature: "lpf(frequency: number)",
    description: "Low-pass filter",
    parameters: [],
    examples: [],
    category: "effect",
  },
  {
    name: "lpq",
    signature: "lpq(resonance: number)",
    description: "Low-pass filter resonance",
    parameters: [],
    examples: [],
    category: "effect",
  },
  {
    name: "note",
    signature: "note(pattern: string)",
    description: "Define pitches",
    parameters: [],
    examples: [],
    category: "core",
  },
  {
    name: "s",
    signature: "s(pattern: string)",
    description: "Select sample",
    parameters: [],
    examples: [],
    category: "core",
  },
]

describe("getWordAtPosition", () => {
  it("returns word at cursor", () => {
    const text = 'note("c e g")'
    const result = getWordAtPosition(text, { line: 0, character: 2 })
    expect(result).toBe("note")
  })

  it("returns word when cursor at end", () => {
    const text = 'note("c e g")'
    const result = getWordAtPosition(text, { line: 0, character: 4 })
    expect(result).toBe("note")
  })

  it("returns null for whitespace", () => {
    const text = "  "
    const result = getWordAtPosition(text, { line: 0, character: 1 })
    expect(result).toBeNull()
  })

  it("handles line boundaries", () => {
    const text = "a\nb"
    const result = getWordAtPosition(text, { line: 1, character: 0 })
    expect(result).toBe("b")
  })

  it("returns partial word", () => {
    const text = "del"
    const result = getWordAtPosition(text, { line: 0, character: 3 })
    expect(result).toBe("del")
  })

  it("returns null for out of bounds line", () => {
    const text = "note"
    const result = getWordAtPosition(text, { line: 5, character: 0 })
    expect(result).toBeNull()
  })

  it("returns word before special char", () => {
    const text = "note("
    const result = getWordAtPosition(text, { line: 0, character: 4 })
    expect(result).toBe("note")
  })

  it("returns word after dot", () => {
    const text = 'note("c").lpf(500)'
    const result = getWordAtPosition(text, { line: 0, character: 12 })
    expect(result).toBe("lpf")
  })
})

describe("filterByPrefix", () => {
  it("filters matching functions", () => {
    const result = filterByPrefix("lp")(mockApiData)
    expect(result).toHaveLength(2)
    expect(result.map((f) => f.name)).toEqual(["lpf", "lpq"])
  })

  it("returns all when prefix is empty", () => {
    const result = filterByPrefix("")(mockApiData)
    expect(result).toHaveLength(4)
  })

  it("is case insensitive", () => {
    const result = filterByPrefix("LP")(mockApiData)
    expect(result).toHaveLength(2)
  })

  it("returns empty array when no match", () => {
    const result = filterByPrefix("xyz")(mockApiData)
    expect(result).toHaveLength(0)
  })
})

describe("toCompletionItem", () => {
  it("maps StrudelFunction to CompletionItem", () => {
    const fn: StrudelFunction = {
      name: "delay",
      signature: "delay(amount: number)",
      description: "Add delay effect",
      parameters: [],
      examples: ['s("bd").delay(0.5)'],
      category: "effect",
    }

    const result = toCompletionItem(fn)

    expect(result.label).toBe("delay")
    expect(result.kind).toBe(CompletionItemKind.Function)
    expect(result.detail).toBe("delay(amount: number)")
    expect(result.documentation).toBe("Add delay effect")
    expect(result.insertText).toBe("delay")
  })
})

describe("toCompletionItems", () => {
  it("maps array of functions", () => {
    const result = toCompletionItems(mockApiData)
    expect(result).toHaveLength(4)
    expect(result[0]?.label).toBe("lpf")
    expect(result[3]?.label).toBe("s")
  })
})

describe("getCompletions", () => {
  it("returns filtered items for partial word", () => {
    const text = "lp"
    const result = getCompletions(text, { line: 0, character: 2 }, mockApiData)
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.label)).toEqual(["lpf", "lpq"])
  })

  it("returns all items on empty position", () => {
    const text = ""
    const result = getCompletions(text, { line: 0, character: 0 }, mockApiData)
    expect(result).toHaveLength(4)
  })

  it("returns all items after dot", () => {
    const text = 'note("c").'
    const result = getCompletions(text, { line: 0, character: 10 }, mockApiData)
    expect(result).toHaveLength(4)
  })

  it("returns single match", () => {
    const text = "not"
    const result = getCompletions(text, { line: 0, character: 3 }, mockApiData)
    expect(result).toHaveLength(1)
    expect(result[0]?.label).toBe("note")
  })
})
