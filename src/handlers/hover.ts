import type { Hover, HoverParams, TextDocuments } from "vscode-languageserver"
import type { TextDocument } from "vscode-languageserver-textdocument"
import type { ApiData } from "../types.js"
import { getHoverInfo } from "../services/hover.service.js"

export const hoverHandler =
  (apiData: ApiData, documents: TextDocuments<TextDocument>) =>
  (params: HoverParams): Hover | null => {
    const document = documents.get(params.textDocument.uri)
    if (!document) return null

    const text = document.getText()
    return getHoverInfo(text, params.position, apiData)
  }
