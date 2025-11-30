import { describe, expect, it } from "vitest"
import {
  getOperatorAtPosition,
  getStringContext,
  getWordInString,
} from "../src/services/string-context.service.js"

describe("getStringContext", () => {
  it("detects cursor inside double-quoted string", () => {
    const text = 'note("c3 e3 g3")'
    const result = getStringContext(text, { line: 0, character: 8 })
    expect(result).not.toBeNull()
    expect(result?.inString).toBe(true)
    expect(result?.content).toBe("c3 e3 g3")
  })

  it("detects cursor inside backtick string", () => {
    const text = "note(`c3 e3 g3`)"
    const result = getStringContext(text, { line: 0, character: 8 })
    expect(result).not.toBeNull()
    expect(result?.content).toBe("c3 e3 g3")
  })

  it("returns null when outside string", () => {
    const text = 'note("c3 e3 g3")'
    const result = getStringContext(text, { line: 0, character: 2 })
    expect(result).toBeNull()
  })

  it("returns null for empty line", () => {
    const text = ""
    const result = getStringContext(text, { line: 0, character: 0 })
    expect(result).toBeNull()
  })

  it("handles string at end of line", () => {
    const text = 's("bd sd")'
    const result = getStringContext(text, { line: 0, character: 5 })
    expect(result).not.toBeNull()
    expect(result?.content).toBe("bd sd")
  })

  it("calculates cursor offset correctly", () => {
    const text = 'note("c3 e3 g3")'
    const result = getStringContext(text, { line: 0, character: 9 })
    expect(result?.cursorOffset).toBe(3)
  })

  it("handles escaped quotes", () => {
    const text = 's("test\\"value")'
    const result = getStringContext(text, { line: 0, character: 6 })
    expect(result?.inString).toBe(true)
  })

  it("handles multiple strings on line", () => {
    const text = 's("bd").note("c3")'
    const result = getStringContext(text, { line: 0, character: 15 })
    expect(result?.content).toBe("c3")
  })

  it("returns null for out of bounds line", () => {
    const text = 'note("c3")'
    const result = getStringContext(text, { line: 5, character: 0 })
    expect(result).toBeNull()
  })
})

describe("getWordInString", () => {
  it("returns word at cursor position", () => {
    const content = "c3 e3 g3"
    const result = getWordInString(content, 1)
    expect(result).toBe("c3")
  })

  it("returns word when cursor at end", () => {
    const content = "c3 e3 g3"
    const result = getWordInString(content, 2)
    expect(result).toBe("c3")
  })

  it("returns null for pure whitespace", () => {
    const content = "c3  e3"
    const result = getWordInString(content, 3)
    expect(result).toBeNull()
  })

  it("handles sharps in note names", () => {
    const content = "c#3 eb3"
    const result = getWordInString(content, 2)
    expect(result).toBe("c#3")
  })

  it("returns null for out of bounds", () => {
    const content = "c3"
    const result = getWordInString(content, 10)
    expect(result).toBeNull()
  })

  it("returns null for negative offset", () => {
    const content = "c3"
    const result = getWordInString(content, -1)
    expect(result).toBeNull()
  })
})

describe("getOperatorAtPosition", () => {
  it("detects * operator", () => {
    const content = "bd*4"
    const result = getOperatorAtPosition(content, 2)
    expect(result).toBe("*")
  })

  it("detects / operator", () => {
    const content = "bd/2"
    const result = getOperatorAtPosition(content, 2)
    expect(result).toBe("/")
  })

  it("detects ~ rest", () => {
    const content = "bd ~ sd"
    const result = getOperatorAtPosition(content, 3)
    expect(result).toBe("~")
  })

  it("detects brackets", () => {
    const content = "[bd bd]"
    const result = getOperatorAtPosition(content, 0)
    expect(result).toBe("[")
  })

  it("returns null for non-operator", () => {
    const content = "bd sd"
    const result = getOperatorAtPosition(content, 1)
    expect(result).toBeNull()
  })

  it("detects comma for parallel", () => {
    const content = "bd,sd"
    const result = getOperatorAtPosition(content, 2)
    expect(result).toBe(",")
  })

  it("detects angle brackets", () => {
    const content = "<bd sd>"
    const result = getOperatorAtPosition(content, 0)
    expect(result).toBe("<")
  })

  it("detects parenthesis for euclidean", () => {
    const content = "bd(3,8)"
    const result = getOperatorAtPosition(content, 2)
    expect(result).toBe("(")
  })
})
