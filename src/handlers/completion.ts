import type { CompletionItem, CompletionParams, TextDocuments } from "vscode-languageserver"
import type { TextDocument } from "vscode-languageserver-textdocument"
import { getCompletions } from "../services/completion.service.js"
import type { ApiData } from "../types.js"

export const completionHandler =
  (apiData: ApiData, documents: TextDocuments<TextDocument>) =>
  (params: CompletionParams): CompletionItem[] => {
    const document = documents.get(params.textDocument.uri)
    if (!document) return []

    const text = document.getText()
    return getCompletions(text, params.position, apiData)
  }
