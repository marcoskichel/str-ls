import type { Position } from "vscode-languageserver"
import type { StringContext } from "../types.js"

const findStringBoundaries = (
  line: string,
  charPos: number,
): { start: number; end: number; quote: string } | null => {
  let inString = false
  let stringStart = -1
  let quoteChar = ""

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const prevChar = line[i - 1]

    if (!inString && (char === '"' || char === "`")) {
      inString = true
      stringStart = i
      quoteChar = char
    } else if (inString && char === quoteChar && prevChar !== "\\") {
      if (charPos > stringStart && charPos <= i) {
        return { start: stringStart, end: i, quote: quoteChar }
      }
      inString = false
      stringStart = -1
      quoteChar = ""
    }
  }

  if (inString && charPos > stringStart) {
    return { start: stringStart, end: line.length, quote: quoteChar }
  }

  return null
}

export const getStringContext = (text: string, position: Position): StringContext | null => {
  const lines = text.split("\n")
  const line = lines[position.line]
  if (!line) return null

  const boundaries = findStringBoundaries(line, position.character)
  if (!boundaries) return null

  const content = line.slice(boundaries.start + 1, boundaries.end)
  const cursorOffset = position.character - boundaries.start - 1

  return {
    inString: true,
    stringStart: boundaries.start,
    stringEnd: boundaries.end,
    content,
    cursorOffset,
  }
}

export const getWordInString = (content: string, cursorOffset: number): string | null => {
  if (cursorOffset < 0 || cursorOffset > content.length) return null

  const wordChars = /[a-zA-Z0-9#_]/
  let start = cursorOffset
  let end = cursorOffset

  while (start > 0 && wordChars.test(content[start - 1] ?? "")) {
    start--
  }

  while (end < content.length && wordChars.test(content[end] ?? "")) {
    end++
  }

  if (start === end) return null
  return content.slice(start, end)
}

export const getOperatorAtPosition = (content: string, cursorOffset: number): string | null => {
  if (cursorOffset < 0 || cursorOffset > content.length) return null

  const operators = ["*", "/", "@", "!", "?", "|", "~", ",", "[", "]", "<", ">", "(", ")"]
  const char = content[cursorOffset] ?? content[cursorOffset - 1]

  if (char && operators.includes(char)) {
    return char
  }

  return null
}
