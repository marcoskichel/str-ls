import { describe, expect, it } from "vitest"
import { MarkupKind } from "vscode-languageserver"
import { findFunction, getHoverInfo, toHoverContent } from "../src/services/hover.service.js"
import type { ApiData, StrudelFunction } from "../src/types.js"

const mockApiData: ApiData = [
  {
    name: "note",
    signature: "note(pattern: string)",
    description: "Define pitches",
    parameters: [],
    examples: ['note("c e g")'],
    category: "core",
  },
  {
    name: "lpf",
    signature: "lpf(frequency: number)",
    description: "Low-pass filter",
    parameters: [],
    examples: [],
    category: "effect",
  },
]

describe("findFunction", () => {
  it("returns matching function", () => {
    const result = findFunction("note")(mockApiData)
    expect(result?.name).toBe("note")
  })

  it("returns undefined for unknown", () => {
    const result = findFunction("xyz")(mockApiData)
    expect(result).toBeUndefined()
  })
})

describe("toHoverContent", () => {
  it("formats markdown with signature and description", () => {
    const fn: StrudelFunction = {
      name: "delay",
      signature: "delay(amount: number)",
      description: "Add delay effect",
      parameters: [],
      examples: [],
      category: "effect",
    }

    const result = toHoverContent(fn)

    expect(result.kind).toBe(MarkupKind.Markdown)
    expect(result.value).toContain("```typescript")
    expect(result.value).toContain("delay(amount: number)")
    expect(result.value).toContain("Add delay effect")
  })

  it("includes examples when present", () => {
    const fn: StrudelFunction = {
      name: "note",
      signature: "note(pattern: string)",
      description: "Define pitches",
      parameters: [],
      examples: ['note("c e g")', 'note("a b c")'],
      category: "core",
    }

    const result = toHoverContent(fn)

    expect(result.value).toContain("**Examples:**")
    expect(result.value).toContain('note("c e g")')
    expect(result.value).toContain('note("a b c")')
  })

  it("omits examples section when empty", () => {
    const fn: StrudelFunction = {
      name: "lpf",
      signature: "lpf(frequency: number)",
      description: "Low-pass filter",
      parameters: [],
      examples: [],
      category: "effect",
    }

    const result = toHoverContent(fn)

    expect(result.value).not.toContain("**Examples:**")
  })
})

describe("getHoverInfo", () => {
  it("returns hover for known function", () => {
    const text = 'note("c e g")'
    const result = getHoverInfo(text, { line: 0, character: 2 }, mockApiData)

    expect(result).not.toBeNull()
    expect((result?.contents as { value: string }).value).toContain("note(pattern: string)")
  })

  it("returns null for unknown word", () => {
    const text = "xyz"
    const result = getHoverInfo(text, { line: 0, character: 1 }, mockApiData)

    expect(result).toBeNull()
  })

  it("returns null for whitespace", () => {
    const text = "  "
    const result = getHoverInfo(text, { line: 0, character: 1 }, mockApiData)

    expect(result).toBeNull()
  })
})
