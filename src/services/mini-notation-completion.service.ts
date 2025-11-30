import { type CompletionItem, CompletionItemKind, InsertTextFormat } from "vscode-languageserver"
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

const generateNoteWithOctaves = (note: MiniNotationElement): readonly CompletionItem[] => {
  const octaves = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  return octaves.map((octave) => ({
    label: `${note.name}${octave}`,
    kind: CompletionItemKind.Value,
    detail: `${note.description} (octave ${octave})`,
    documentation: note.examples.join("\n"),
    insertText: `${note.name}${octave}`,
  }))
}

const toNoteCompletion = (note: MiniNotationElement): CompletionItem => ({
  label: note.name,
  kind: CompletionItemKind.Value,
  detail: note.description,
  documentation: note.examples.join("\n"),
  insertText: note.name,
})

const toSampleCompletion = (sample: MiniNotationElement): CompletionItem => ({
  label: sample.name,
  kind: CompletionItemKind.Value,
  detail: sample.description,
  documentation: sample.examples.join("\n"),
  insertText: sample.name,
})

const toOperatorCompletion = (op: MiniNotationElement): CompletionItem => ({
  label: op.name,
  kind: CompletionItemKind.Operator,
  detail: op.description,
  documentation: op.examples.join("\n"),
  insertText: op.name,
})

const toEuclideanSnippet = (): CompletionItem => ({
  label: "euclidean",
  kind: CompletionItemKind.Snippet,
  detail: "Euclidean rhythm (pulses, steps, offset)",
  documentation:
    "Creates a Euclidean rhythm pattern\nExample: bd(3,8) - 3 beats spread over 8 steps",
  insertText: "(${1:3},${2:8})",
  insertTextFormat: InsertTextFormat.Snippet,
})

export const filterByPrefix =
  (prefix: string | null) =>
  <T extends { name: string }>(items: readonly T[]): readonly T[] => {
    if (!prefix) return items
    const lowerPrefix = prefix.toLowerCase()
    return items.filter((item) => item.name.toLowerCase().startsWith(lowerPrefix))
  }

export const getMiniNotationCompletions = (
  data: MiniNotationJson,
  extendedData: ExtendedSamplesJson | null,
  prefix: string | null,
): CompletionItem[] => {
  const filter = filterByPrefix(prefix)

  const noteCompletions = filter(data.notes).flatMap((note) => [
    toNoteCompletion(note),
    ...generateNoteWithOctaves(note),
  ])

  const sampleCompletions = filter(data.samples).map(toSampleCompletion)
  const operatorCompletions = filter(data.operators).map(toOperatorCompletion)

  const completions = [...noteCompletions, ...sampleCompletions, ...operatorCompletions]

  if (extendedData) {
    const gmCompletions = filter(extendedData.gmInstruments).map(toSampleCompletion)
    const drumMachineCompletions = filter(extendedData.drumMachines).map(toSampleCompletion)
    const synthCompletions = filter(extendedData.synths).map(toSampleCompletion)
    completions.push(...gmCompletions, ...drumMachineCompletions, ...synthCompletions)
  }

  if (!prefix || "euclidean".startsWith(prefix.toLowerCase())) {
    completions.push(toEuclideanSnippet())
  }

  return completions
}
