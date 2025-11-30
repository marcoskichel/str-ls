import {
  type Connection,
  type InitializeResult,
  createConnection,
  ProposedFeatures,
  TextDocuments,
} from "vscode-languageserver/node.js"
import { TextDocument } from "vscode-languageserver-textdocument"
import { serverCapabilities } from "./capabilities.js"
import { completionHandler } from "./handlers/completion.js"
import { hoverHandler } from "./handlers/hover.js"
import type { ApiData } from "./types.js"
import apiData from "./data/strudel-api.json" with { type: "json" }

const createServer = (): Connection => createConnection(ProposedFeatures.all)

const initialize = (connection: Connection, documents: TextDocuments<TextDocument>): void => {
  const data = apiData as ApiData

  connection.onInitialize((): InitializeResult => {
    return { capabilities: serverCapabilities }
  })

  connection.onCompletion(completionHandler(data, documents))
  connection.onHover(hoverHandler(data, documents))
}

const start = (connection: Connection, documents: TextDocuments<TextDocument>): void => {
  documents.listen(connection)
  connection.listen()
}

const connection = createServer()
const documents = new TextDocuments(TextDocument)

initialize(connection, documents)
start(connection, documents)
