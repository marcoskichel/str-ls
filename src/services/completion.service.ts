import type { CompletionItem, Position } from "vscode-languageserver"
import type { ApiData } from "../types.js"

export const getCompletions = (
  _text: string,
  _position: Position,
  _apiData: ApiData
): CompletionItem[] => {
  return []
}
