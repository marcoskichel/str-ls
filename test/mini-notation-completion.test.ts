import { describe, expect, it } from "vitest"
import { CompletionItemKind, InsertTextFormat } from "vscode-languageserver"
import {
  filterByPrefix,
  getMiniNotationCompletions,
} from "../src/services/mini-notation-completion.service.js"

const mockMiniNotationData = {
  notes: [
    {
      name: "c",
      description: "C natural note",
      examples: ['note("c3")'],
      category: "note" as const,
    },
    {
      name: "c#",
      description: "C sharp note",
      examples: ['note("c#3")'],
      category: "note" as const,
    },
    {
      name: "d",
      description: "D natural note",
      examples: ['note("d3")'],
      category: "note" as const,
    },
  ],
  samples: [
    { name: "bd", description: "Bass drum", examples: ['s("bd")'], category: "sample" as const },
    { name: "sd", description: "Snare drum", examples: ['s("sd")'], category: "sample" as const },
    { name: "hh", description: "Hi-hat", examples: ['s("hh")'], category: "sample" as const },
  ],
  operators: [
    {
      name: "*",
      description: "Multiply/speed up",
      examples: ['s("bd*4")'],
      category: "operator" as const,
    },
    {
      name: "/",
      description: "Divide/slow down",
      examples: ['s("bd/2")'],
      category: "operator" as const,
    },
    {
      name: "~",
      description: "Rest/silence",
      examples: ['s("bd ~ sd")'],
      category: "operator" as const,
    },
  ],
}

describe("filterByPrefix", () => {
  it("filters items by prefix", () => {
    const items = [{ name: "bd" }, { name: "sd" }, { name: "bass" }]
    const result = filterByPrefix("b")(items)
    expect(result).toHaveLength(2)
    expect(result.map((i) => i.name)).toEqual(["bd", "bass"])
  })

  it("returns all items when prefix is null", () => {
    const items = [{ name: "bd" }, { name: "sd" }]
    const result = filterByPrefix(null)(items)
    expect(result).toHaveLength(2)
  })

  it("is case insensitive", () => {
    const items = [{ name: "bd" }, { name: "BD" }]
    const result = filterByPrefix("B")(items)
    expect(result).toHaveLength(2)
  })
})

describe("getMiniNotationCompletions", () => {
  it("returns completions for notes with octaves", () => {
    const result = getMiniNotationCompletions(mockMiniNotationData, null, "c")
    const noteCompletions = result.filter((r) => r.label.startsWith("c"))
    expect(noteCompletions.length).toBeGreaterThan(1)
    expect(noteCompletions.some((c) => c.label === "c")).toBe(true)
    expect(noteCompletions.some((c) => c.label === "c3")).toBe(true)
    expect(noteCompletions.some((c) => c.label === "c#")).toBe(true)
  })

  it("returns sample completions", () => {
    const result = getMiniNotationCompletions(mockMiniNotationData, null, "b")
    const bdCompletion = result.find((r) => r.label === "bd")
    expect(bdCompletion).toBeDefined()
    expect(bdCompletion?.kind).toBe(CompletionItemKind.Value)
    expect(bdCompletion?.detail).toBe("Bass drum")
  })

  it("returns operator completions", () => {
    const result = getMiniNotationCompletions(mockMiniNotationData, null, "*")
    const starCompletion = result.find((r) => r.label === "*")
    expect(starCompletion).toBeDefined()
    expect(starCompletion?.kind).toBe(CompletionItemKind.Operator)
  })

  it("returns euclidean snippet", () => {
    const result = getMiniNotationCompletions(mockMiniNotationData, null, null)
    const euclidean = result.find((r) => r.label === "euclidean")
    expect(euclidean).toBeDefined()
    expect(euclidean?.kind).toBe(CompletionItemKind.Snippet)
    expect(euclidean?.insertTextFormat).toBe(InsertTextFormat.Snippet)
  })

  it("filters by prefix", () => {
    const result = getMiniNotationCompletions(mockMiniNotationData, null, "sd")
    expect(result.some((r) => r.label === "sd")).toBe(true)
    expect(result.some((r) => r.label === "bd")).toBe(false)
  })

  it("returns all completions when prefix is null", () => {
    const result = getMiniNotationCompletions(mockMiniNotationData, null, null)
    expect(result.length).toBeGreaterThan(10)
  })

  it("generates octave variants for notes", () => {
    const result = getMiniNotationCompletions(mockMiniNotationData, null, "c")
    const octaveNotes = result.filter((r) => /^c\d$/.test(r.label))
    expect(octaveNotes).toHaveLength(10)
    expect(octaveNotes[0]?.label).toBe("c0")
    expect(octaveNotes[9]?.label).toBe("c9")
  })
})
