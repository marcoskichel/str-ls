import { type Hover, type MarkupContent, MarkupKind } from "vscode-languageserver"
import type { MiniNotationElement } from "../types.js"

type MiniNotationJson = {
  readonly notes: readonly MiniNotationElement[]
  readonly samples: readonly MiniNotationElement[]
  readonly operators: readonly MiniNotationElement[]
}

type ExtendedSamplesJson = {
  readonly gmInstruments: readonly MiniNotationElement[]
  readonly drumMachines: readonly MiniNotationElement[]
  readonly synths: readonly MiniNotationElement[]
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

const findExtendedSample = (
  name: string,
  extendedData: ExtendedSamplesJson,
): MiniNotationElement | undefined => {
  const lowerName = name.toLowerCase()
  return (
    extendedData.gmInstruments.find((s) => s.name.toLowerCase() === lowerName) ??
    extendedData.drumMachines.find((s) => s.name.toLowerCase() === lowerName) ??
    extendedData.synths.find((s) => s.name.toLowerCase() === lowerName)
  )
}

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
  extendedData: ExtendedSamplesJson | null,
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

  if (extendedData) {
    const extendedElement = findExtendedSample(word, extendedData)
    if (extendedElement) {
      return { contents: toHoverContent(extendedElement) }
    }
  }

  return null
}
