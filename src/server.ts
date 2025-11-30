import { TextDocument } from "vscode-languageserver-textdocument"
import {
  type Connection,
  type InitializeResult,
  ProposedFeatures,
  TextDocuments,
  createConnection,
} from "vscode-languageserver/node.js"
import { serverCapabilities } from "./capabilities.js"
import apiData from "./data/strudel-api.json" with { type: "json" }
import { completionHandler } from "./handlers/completion.js"
import { hoverHandler } from "./handlers/hover.js"
import type { ApiData } from "./types.js"

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
