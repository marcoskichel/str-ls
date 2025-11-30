import { type Hover, type MarkupContent, MarkupKind, type Position } from "vscode-languageserver"
import type { ApiData, StrudelFunction } from "../types.js"
import { getWordAtPosition } from "./completion.service.js"

export const findFunction =
  (name: string) =>
  (apiData: ApiData): StrudelFunction | undefined =>
    apiData.find((fn) => fn.name === name)

export const toHoverContent = (fn: StrudelFunction): MarkupContent => {
  const lines = [`\`\`\`typescript\n${fn.signature}\n\`\`\``, "", fn.description]

  if (fn.examples.length > 0) {
    lines.push("", "**Examples:**", `\`\`\`javascript\n${fn.examples.join("\n")}\n\`\`\``)
  }

  return {
    kind: MarkupKind.Markdown,
    value: lines.join("\n"),
  }
}

export const getHoverInfo = (text: string, position: Position, apiData: ApiData): Hover | null => {
  const word = getWordAtPosition(text, position)
  if (!word) return null

  const fn = findFunction(word)(apiData)
  if (!fn) return null

  return { contents: toHoverContent(fn) }
}
