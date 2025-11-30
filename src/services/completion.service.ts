import type { CompletionItem, Position } from "vscode-languageserver"
import type { ApiData } from "../types.js"

const isWordChar = (char: string): boolean => /[a-zA-Z0-9_]/.test(char)

export const getWordAtPosition = (text: string, position: Position): string | null => {
  const lines = text.split("\n")
  const line = lines[position.line]
  if (!line) return null

  let start = position.character
  let end = position.character

  while (start > 0 && isWordChar(line[start - 1] ?? "")) {
    start--
  }

  while (end < line.length && isWordChar(line[end] ?? "")) {
    end++
  }

  if (start === end) return null

  return line.slice(start, end)
}

export const getCompletions = (
  _text: string,
  _position: Position,
  _apiData: ApiData
): CompletionItem[] => {
  return []
}
