import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import type { StrudelFunction, Parameter } from "../src/types.js"

const STRUDEL_CORE_PATH = "./node_modules/@strudel/core"

type JsDocBlock = {
  name: string
  description: string
  params: Parameter[]
  examples: string[]
  synonyms: string[]
}

const parseJsDocBlock = (block: string): JsDocBlock | null => {
  const nameMatch = block.match(/@name\s+(\w+)/)
  if (!nameMatch) return null

  const name = nameMatch[1] ?? ""

  const descLines: string[] = []
  const lines = block.split("\n")
  for (const line of lines) {
    const cleaned = line.replace(/^\s*\*\s?/, "").trim()
    if (cleaned.startsWith("@")) break
    if (cleaned && !cleaned.startsWith("/*")) {
      descLines.push(cleaned)
    }
  }
  const description = descLines.join(" ").trim()

  const params: Parameter[] = []
  const paramMatches = block.matchAll(/@param\s+\{([^}]+)\}\s+(\w+)\s*(.*)/g)
  for (const match of paramMatches) {
    params.push({
      name: match[2] ?? "",
      type: match[1] ?? "",
      description: match[3]?.trim() ?? "",
      optional: false,
    })
  }

  const examples: string[] = []
  const exampleMatches = block.matchAll(/@example\s*\n([^@]*?)(?=\s*(?:\*\s*@|\*\/))/gs)
  for (const match of exampleMatches) {
    const example = (match[1] ?? "")
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, "").trim())
      .filter((l) => l)
      .join("\n")
    if (example) examples.push(example)
  }

  const synonyms: string[] = []
  const synMatch = block.match(/@synonyms?\s+(.+)/)
  if (synMatch) {
    synonyms.push(...(synMatch[1]?.split(/[,\s]+/).filter(Boolean) ?? []))
  }

  return { name, description, params, examples, synonyms }
}

const extractJsDocBlocks = (content: string): JsDocBlock[] => {
  const blocks: JsDocBlock[] = []
  const regex = /\/\*\*[\s\S]*?\*\//g
  const matches = content.matchAll(regex)

  for (const match of matches) {
    const parsed = parseJsDocBlock(match[0])
    if (parsed) {
      blocks.push(parsed)
    }
  }

  return blocks
}

const categorizeFunction = (name: string): StrudelFunction["category"] => {
  const effectPatterns = [
    /^lp[a-z]?$/,
    /^hp[a-z]?$/,
    /^bp[a-z]?$/,
    /delay/,
    /room/,
    /reverb/,
    /phaser/,
    /crush/,
    /distort/,
    /gain/,
    /pan/,
    /vowel/,
    /attack/,
    /decay/,
    /sustain/,
    /release/,
    /tremolo/,
    /vibrato/,
    /orbit/,
    /compress/,
    /shape/,
    /coarse/,
  ]

  const patternOps = [/^fast$/, /^slow$/, /^rev$/, /^jux/, /^chunk$/, /^ply$/, /^struct$/, /^mask$/]

  const synthPatterns = [/^wt/, /^fm/, /sine|saw|square|triangle|noise/]

  if (effectPatterns.some((p) => p.test(name))) return "effect"
  if (patternOps.some((p) => p.test(name))) return "pattern"
  if (synthPatterns.some((p) => p.test(name))) return "synth"
  return "core"
}

const buildSignature = (name: string, params: Parameter[]): string => {
  if (params.length === 0) return `${name}()`
  const paramStr = params.map((p) => `${p.name}: ${p.type}`).join(", ")
  return `${name}(${paramStr})`
}

const toStrudelFunction = (block: JsDocBlock): StrudelFunction => ({
  name: block.name,
  signature: buildSignature(block.name, block.params),
  description: block.description,
  parameters: block.params,
  examples: block.examples,
  category: categorizeFunction(block.name),
})

const main = () => {
  const functions: StrudelFunction[] = []
  const seen = new Set<string>()

  const files = readdirSync(STRUDEL_CORE_PATH).filter((f) => f.endsWith(".mjs"))

  for (const file of files) {
    const content = readFileSync(join(STRUDEL_CORE_PATH, file), "utf-8")
    const blocks = extractJsDocBlocks(content)

    for (const block of blocks) {
      if (!seen.has(block.name)) {
        seen.add(block.name)
        functions.push(toStrudelFunction(block))
      }

      for (const syn of block.synonyms) {
        if (!seen.has(syn)) {
          seen.add(syn)
          functions.push({
            ...toStrudelFunction(block),
            name: syn,
            signature: buildSignature(syn, block.params),
          })
        }
      }
    }
  }

  functions.sort((a, b) => a.name.localeCompare(b.name))

  const outputPath = "./src/data/strudel-api.json"
  writeFileSync(outputPath, JSON.stringify(functions, null, 2))

  console.log(`Generated ${functions.length} function definitions to ${outputPath}`)
}

main()
