import type { Hover, Position } from "vscode-languageserver"
import type { ApiData } from "../types.js"

export const getHoverInfo = (
  _text: string,
  _position: Position,
  _apiData: ApiData
): Hover | null => {
  return null
}
