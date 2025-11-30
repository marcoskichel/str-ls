import type { CompletionItem, CompletionParams, TextDocuments } from "vscode-languageserver"
import type { TextDocument } from "vscode-languageserver-textdocument"
import extendedSamplesData from "../data/extended-samples.json" with { type: "json" }
import miniNotationData from "../data/mini-notation.json" with { type: "json" }
import { getCompletions } from "../services/completion.service.js"
import { getMiniNotationCompletions } from "../services/mini-notation-completion.service.js"
import { getStringContext, getWordInString } from "../services/string-context.service.js"
import type { ApiData } from "../types.js"

export const completionHandler =
  (apiData: ApiData, documents: TextDocuments<TextDocument>) =>
  (params: CompletionParams): CompletionItem[] => {
    const document = documents.get(params.textDocument.uri)
    if (!document) return []

    const text = document.getText()

    const stringContext = getStringContext(text, params.position)
    if (stringContext) {
      const prefix = getWordInString(stringContext.content, stringContext.cursorOffset)
      return getMiniNotationCompletions(miniNotationData, extendedSamplesData, prefix)
    }

    return getCompletions(text, params.position, apiData)
  }
