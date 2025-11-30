import { type Hover, type MarkupContent, MarkupKind } from "vscode-languageserver"
import type { MiniNotationElement } from "../types.js"

type MiniNotationJson = {
  readonly notes: readonly MiniNotationElement[]
  readonly samples: readonly MiniNotationElement[]
  readonly operators: readonly MiniNotationElement[]
}

const parseNoteWord = (word: string): { note: string; octave: string | null } | null => {
  const match = word.match(/^([a-g][#b]?)(\d)?$/i)
  if (!match) return null
  return { note: match[1].toLowerCase(), octave: match[2] ?? null }
}

const findNote = (noteName: string, data: MiniNotationJson): MiniNotationElement | undefined =>
  data.notes.find((n) => n.name === noteName)

const findSample = (name: string, data: MiniNotationJson): MiniNotationElement | undefined =>
  data.samples.find((s) => s.name === name.toLowerCase())

const findOperator = (op: string, data: MiniNotationJson): MiniNotationElement | undefined =>
  data.operators.find((o) => o.name === op)

const toHoverContent = (element: MiniNotationElement, extra?: string): MarkupContent => {
  const lines = [`**${element.name}**`, "", element.description]

  if (extra) {
    lines.push("", extra)
  }

  if (element.examples.length > 0) {
    lines.push("", "**Examples:**", "```javascript", ...element.examples, "```")
  }

  return {
    kind: MarkupKind.Markdown,
    value: lines.join("\n"),
  }
}

export const getMiniNotationHover = (
  data: MiniNotationJson,
  word: string | null,
  operator: string | null,
): Hover | null => {
  if (operator) {
    const opElement = findOperator(operator, data)
    if (opElement) {
      return { contents: toHoverContent(opElement) }
    }
  }

  if (!word) return null

  const parsed = parseNoteWord(word)
  if (parsed) {
    const noteElement = findNote(parsed.note, data)
    if (noteElement) {
      const octaveInfo = parsed.octave ? `Octave: ${parsed.octave}` : null
      return { contents: toHoverContent(noteElement, octaveInfo ?? undefined) }
    }
  }

  const sampleElement = findSample(word, data)
  if (sampleElement) {
    return { contents: toHoverContent(sampleElement) }
  }

  return null
}
