import { describe, expect, it } from "vitest"
import { getWordAtPosition } from "../src/services/completion.service.js"

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
