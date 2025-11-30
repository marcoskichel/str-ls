import { describe, expect, it } from "vitest"
import { MarkupKind } from "vscode-languageserver"
import { getMiniNotationHover } from "../src/services/mini-notation-hover.service.js"

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
      name: "eb",
      description: "E flat note",
      examples: ['note("eb3")'],
      category: "note" as const,
    },
  ],
  samples: [
    { name: "bd", description: "Bass drum", examples: ['s("bd")'], category: "sample" as const },
    { name: "sd", description: "Snare drum", examples: ['s("sd")'], category: "sample" as const },
  ],
  operators: [
    {
      name: "*",
      description: "Multiply/speed up",
      examples: ['s("bd*4")'],
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

describe("getMiniNotationHover", () => {
  it("returns hover for note", () => {
    const result = getMiniNotationHover(mockMiniNotationData, null, "c3", null)
    expect(result).not.toBeNull()
    expect(result?.contents.kind).toBe(MarkupKind.Markdown)
    expect((result?.contents as { value: string }).value).toContain("C natural note")
    expect((result?.contents as { value: string }).value).toContain("Octave: 3")
  })

  it("returns hover for sharp note", () => {
    const result = getMiniNotationHover(mockMiniNotationData, null, "c#4", null)
    expect(result).not.toBeNull()
    expect((result?.contents as { value: string }).value).toContain("C sharp note")
  })

  it("returns hover for flat note", () => {
    const result = getMiniNotationHover(mockMiniNotationData, null, "eb3", null)
    expect(result).not.toBeNull()
    expect((result?.contents as { value: string }).value).toContain("E flat note")
  })

  it("returns hover for sample", () => {
    const result = getMiniNotationHover(mockMiniNotationData, null, "bd", null)
    expect(result).not.toBeNull()
    expect((result?.contents as { value: string }).value).toContain("Bass drum")
  })

  it("returns hover for operator", () => {
    const result = getMiniNotationHover(mockMiniNotationData, null, null, "*")
    expect(result).not.toBeNull()
    expect((result?.contents as { value: string }).value).toContain("Multiply/speed up")
  })

  it("returns hover for rest operator", () => {
    const result = getMiniNotationHover(mockMiniNotationData, null, null, "~")
    expect(result).not.toBeNull()
    expect((result?.contents as { value: string }).value).toContain("Rest/silence")
  })

  it("returns null for unknown word", () => {
    const result = getMiniNotationHover(mockMiniNotationData, null, "xyz", null)
    expect(result).toBeNull()
  })

  it("returns null when both word and operator are null", () => {
    const result = getMiniNotationHover(mockMiniNotationData, null, null, null)
    expect(result).toBeNull()
  })

  it("prioritizes operator over word", () => {
    const result = getMiniNotationHover(mockMiniNotationData, null, "bd", "*")
    expect(result).not.toBeNull()
    expect((result?.contents as { value: string }).value).toContain("Multiply")
  })

  it("includes examples in hover", () => {
    const result = getMiniNotationHover(mockMiniNotationData, null, "bd", null)
    expect((result?.contents as { value: string }).value).toContain("Examples")
    expect((result?.contents as { value: string }).value).toContain('s("bd")')
  })

  it("handles note without octave", () => {
    const result = getMiniNotationHover(mockMiniNotationData, null, "c", null)
    expect(result).not.toBeNull()
    expect((result?.contents as { value: string }).value).toContain("C natural note")
    expect((result?.contents as { value: string }).value).not.toContain("Octave:")
  })
})
