import {
  CompletionItemKind,
  type ServerCapabilities,
  TextDocumentSyncKind,
} from "vscode-languageserver"

export const serverCapabilities: ServerCapabilities = {
  textDocumentSync: TextDocumentSyncKind.Incremental,
  completionProvider: {
    resolveProvider: false,
    triggerCharacters: [".", "(", '"'],
  },
  hoverProvider: true,
}

export const completionItemKind = CompletionItemKind.Function
