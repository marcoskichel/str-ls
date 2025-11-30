import type { Hover, HoverParams, TextDocuments } from "vscode-languageserver"
import type { TextDocument } from "vscode-languageserver-textdocument"
import miniNotationData from "../data/mini-notation.json" with { type: "json" }
import { getHoverInfo } from "../services/hover.service.js"
import { getMiniNotationHover } from "../services/mini-notation-hover.service.js"
import {
  getOperatorAtPosition,
  getStringContext,
  getWordInString,
} from "../services/string-context.service.js"
import type { ApiData } from "../types.js"

export const hoverHandler =
  (apiData: ApiData, documents: TextDocuments<TextDocument>) =>
  (params: HoverParams): Hover | null => {
    const document = documents.get(params.textDocument.uri)
    if (!document) return null

    const text = document.getText()

    const stringContext = getStringContext(text, params.position)
    if (stringContext) {
      const word = getWordInString(stringContext.content, stringContext.cursorOffset)
      const operator = getOperatorAtPosition(stringContext.content, stringContext.cursorOffset)
      return getMiniNotationHover(miniNotationData, word, operator)
    }

    return getHoverInfo(text, params.position, apiData)
  }
