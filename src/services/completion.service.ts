import { CompletionItemKind, type CompletionItem, type Position } from "vscode-languageserver"
import type { ApiData, StrudelFunction } from "../types.js"

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

export const filterByPrefix =
  (prefix: string) =>
  (fns: ApiData): ApiData => {
    if (!prefix) return fns
    const lowerPrefix = prefix.toLowerCase()
    return fns.filter((fn) => fn.name.toLowerCase().startsWith(lowerPrefix))
  }

export const toCompletionItem = (fn: StrudelFunction): CompletionItem => ({
  label: fn.name,
  kind: CompletionItemKind.Function,
  detail: fn.signature,
  documentation: fn.description,
  insertText: fn.name,
})

export const toCompletionItems = (fns: ApiData): CompletionItem[] => fns.map(toCompletionItem)

export const getCompletions = (
  _text: string,
  _position: Position,
  _apiData: ApiData
): CompletionItem[] => {
  return []
}
