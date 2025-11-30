# Strudel LSP - Planning Document

## Overview
Language Server Protocol implementation for Strudel live coding language.

## Target Features
- [ ] Autocompletion
- [ ] Hover documentation

## Requirements

### Language
**Decision:** TypeScript/Node
- Rationale: Same ecosystem as Strudel, rich LSP tooling via `vscode-languageserver`, potential to reuse Strudel's parser

### LSP Communication
**Decision:** stdio transport
- Rationale: Standard LSP transport, works with any editor

### Editor Integration
**Decision:** Editor-agnostic
- Primary: stdio-based server compatible with any LSP client
- VS Code, Neovim, Emacs, etc. can all connect
- May add thin VS Code extension later for convenience

### Data Source for Completions/Docs
**Decision:** Import from `@strudel/core`
- Rationale: Always up-to-date with Strudel, includes type info
- Extraction: Pre-generate at build time using TS Compiler API
- Build script parses `@strudel/core` source → extracts JSDoc + signatures → outputs JSON
- JSON bundled with LSP for fast startup

### Supported File Types
**Decision:** `.strudel`, `.str`, `.std`
- Primary: `.strudel` (explicit)
- Short forms: `.str`, `.std` (convenience)

### Package Manager
**Decision:** pnpm
- Rationale: Fast, disk efficient, strict dependency resolution

### Build Tool
**Decision:** tsup
- Rationale: Fast (esbuild-based), bundles to single file, minimal config, handles CJS/ESM

### Testing Framework
**Decision:** Vitest
- Rationale: Fast, native TypeScript/ESM support, Jest-compatible API

### Linting & Formatting
**Decision:** Biome
- Rationale: Single tool for lint + format, fast, sensible defaults

---

## Strudel API Reference (gathered from docs)

### Core Functions
- `s()` - Select sample/synth
- `n()` - Note number
- `note()` - Define pitches
- `sound()` - Alias for s()
- `stack()` - Combine patterns
- `samples()` - Load sample packs
- `setcps()` - Set cycles per second (tempo)
- `chord()` - Create chord patterns
- `bank()` - Select instrument bank

### Effects
- `lpf()` / `hpf()` / `bpf()` - Filters
- `lpq()` / `hpq()` / `bpq()` - Filter resonance
- `room()` / `roomsize()` - Reverb
- `delay()` / `delaytime()` / `delayfeedback()` - Delay
- `gain()` / `velocity()` - Volume
- `pan()` - Stereo position
- `attack()` / `decay()` / `sustain()` / `release()` - ADSR envelope
- `phaser()` / `phaserdepth()` - Phaser effect
- `crush()` / `coarse()` / `distort()` - Waveshaping
- `vowel()` - Formant filter

### Pattern Manipulation
- `fast()` / `slow()` - Time scaling
- `early()` / `late()` - Time offset
- `rev()` - Reverse pattern
- `jux()` / `juxBy()` - Stereo effects
- `chunk()` - Process chunks
- `ply()` - Repeat notes
- `struct()` - Rhythmic structure
- `mask()` - Gate patterns
- `rarely()` / `sometimes()` - Probabilistic modifiers

### Mini-Notation Syntax
- Spaces - Separate events
- `[]` - Group/subdivide
- `<>` - Alternate
- `*` - Speed up
- `/` - Slow down
- `,` - Chord/polyphony
- `~` - Rest
- `@` - Elongate
- `!` - Repeat
- `?` - Probabilistic
- `|` - Random choice
- `()` - Euclidean rhythm

### Synthesizers
- Basic: sine, sawtooth, square, triangle
- Noise: white, pink, brown, crackle
- ZZFX: z_sawtooth, z_tan, z_noise, z_sine, z_square
- Wavetable: wt_* prefix (AKWF library)

---

## Decisions

### A) File Layout
```
str_lsp/
├── src/
│   ├── server.ts              # LSP server entry point, connection setup
│   ├── capabilities.ts        # LSP capability declarations
│   ├── handlers/
│   │   ├── completion.ts      # textDocument/completion handler
│   │   └── hover.ts           # textDocument/hover handler
│   ├── data/
│   │   └── strudel-api.json   # Pre-generated API docs (build output)
│   ├── services/
│   │   ├── completion.service.ts   # Completion logic
│   │   └── hover.service.ts        # Hover logic
│   └── types.ts               # Shared type definitions
├── scripts/
│   └── generate-api-data.ts   # Extracts docs from @strudel/core
├── test/
│   ├── completion.test.ts
│   ├── hover.test.ts
│   └── fixtures/              # Test .strudel files
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── biome.json
└── vitest.config.ts
```

### B) Class/Method Structure (FP Style)
```typescript
// types.ts
type StrudelFunction = {
  readonly name: string
  readonly signature: string
  readonly description: string
  readonly parameters: readonly Parameter[]
  readonly examples: readonly string[]
  readonly category: 'core' | 'effect' | 'pattern' | 'synth'
}

type Parameter = {
  readonly name: string
  readonly type: string
  readonly description: string
  readonly optional: boolean
}

type ApiData = readonly StrudelFunction[]

// server.ts
const createServer: () => Connection
const initialize: (connection: Connection) => ServerCapabilities
const start: (connection: Connection) => void

// capabilities.ts
const serverCapabilities: ServerCapabilities

// handlers/completion.ts
const completionHandler: (apiData: ApiData) =>
  (params: CompletionParams) => CompletionItem[]

// handlers/hover.ts
const hoverHandler: (apiData: ApiData) =>
  (params: HoverParams) => Hover | null

// services/completion.service.ts
const getCompletions: (text: string, position: Position, apiData: ApiData) => CompletionItem[]
const getWordAtPosition: (text: string, position: Position) => string | null
const filterByPrefix: (prefix: string) => (fns: ApiData) => ApiData
const toCompletionItem: (fn: StrudelFunction) => CompletionItem
const toCompletionItems: (fns: ApiData) => CompletionItem[]

// services/hover.service.ts
const getHoverInfo: (text: string, position: Position, apiData: ApiData) => Hover | null
const findFunction: (name: string) => (apiData: ApiData) => StrudelFunction | undefined
const toHoverContent: (fn: StrudelFunction) => MarkupContent

// scripts/generate-api-data.ts
const parseSource: (path: string) => SourceFile
const extractFunctions: (sourceFile: SourceFile) => StrudelFunction[]
const extractJsDoc: (node: Node) => { description: string; params: Parameter[] }
const writeJson: (path: string) => (data: ApiData) => void
```

### C) Function Pseudocode
```
// server.ts
createServer:
  - Create stdio connection via createConnection()
  - Create TextDocuments manager for document sync
  - Return connection

initialize:
  - Load apiData from strudel-api.json
  - Register onCompletion with completionHandler(apiData)
  - Register onHover with hoverHandler(apiData)
  - Return serverCapabilities

start:
  - documents.listen(connection)
  - connection.listen()

// services/completion.service.ts
getWordAtPosition:
  - Split text into lines
  - Get line at position.line
  - Scan backwards from position.character to find word start
  - Scan forwards to find word end (if mid-word)
  - Return substring or null if whitespace/empty

filterByPrefix:
  - Return fns.filter(fn => fn.name.startsWith(prefix))
  - If prefix empty, return all fns

toCompletionItem:
  - Return { label: fn.name, kind: Function, detail: fn.signature,
             documentation: fn.description, insertText: fn.name }

getCompletions:
  - word = getWordAtPosition(text, position)
  - If word is null → return toCompletionItems(apiData) // show all
  - filtered = filterByPrefix(word)(apiData)
  - Return toCompletionItems(filtered)

// services/hover.service.ts
findFunction:
  - Return apiData.find(fn => fn.name === name)

toHoverContent:
  - Build markdown string:
    - "```typescript\n{signature}\n```"
    - "\n\n{description}"
    - If examples.length > 0: "\n\n**Examples:**\n```javascript\n{examples.join}\n```"
  - Return { kind: 'markdown', value: markdown }

getHoverInfo:
  - word = getWordAtPosition(text, position)
  - If word is null → return null
  - fn = findFunction(word)(apiData)
  - If fn is undefined → return null
  - Return { contents: toHoverContent(fn) }

// scripts/generate-api-data.ts
parseSource:
  - Create ts.Program with @strudel/core entry point
  - Return program.getSourceFile()

extractJsDoc:
  - Get JSDoc tags from node via ts.getJSDocTags()
  - Extract @param tags → map to Parameter[]
  - Extract description from first JSDoc comment
  - Return { description, params }

extractFunctions:
  - Walk AST with ts.forEachChild
  - For each FunctionDeclaration or exported const arrow:
    - Get name from identifier
    - Get signature from node.getText() or build from params
    - Get { description, params } from extractJsDoc(node)
    - Categorize based on file path or tags
  - Return StrudelFunction[]

writeJson:
  - JSON.stringify(data, null, 2)
  - fs.writeFileSync(path, json)

Failure cases:
- getWordAtPosition: position out of bounds → return null
- findFunction: no match → return undefined
- parseSource: file not found → throw (fail fast at build time)
- extractJsDoc: no JSDoc → return empty description/params
```

### D) TDD Plan

**Unit Tests (test/completion.test.ts):**
| Test Name | Input | Expected Output |
|-----------|-------|-----------------|
| getWordAtPosition returns word at cursor | `"note("`, pos {0,4} | `"note"` |
| getWordAtPosition returns null for whitespace | `"  "`, pos {0,1} | `null` |
| getWordAtPosition handles line boundaries | `"a\nb"`, pos {1,0} | `"b"` |
| getWordAtPosition returns partial word | `"del"`, pos {0,3} | `"del"` |
| filterByPrefix filters matching functions | `"lp"`, apiData | `[lpf, lpq, lpenv...]` |
| filterByPrefix empty prefix returns all | `""`, apiData | all functions |
| toCompletionItem maps correctly | StrudelFunction | CompletionItem with label, kind, detail |
| getCompletions returns filtered items | `"s("`, pos, apiData | items starting with `s` |
| getCompletions returns all on empty | `""`, pos, apiData | all items |

**Unit Tests (test/hover.test.ts):**
| Test Name | Input | Expected Output |
|-----------|-------|-----------------|
| findFunction returns matching function | `"note"`, apiData | StrudelFunction for note |
| findFunction returns undefined for unknown | `"xyz"`, apiData | `undefined` |
| toHoverContent formats markdown | StrudelFunction | MarkupContent with signature, desc |
| toHoverContent includes examples | fn with examples | markdown with examples block |
| getHoverInfo returns hover for known fn | `"delay"`, pos, apiData | Hover object |
| getHoverInfo returns null for unknown | `"xyz"`, pos, apiData | `null` |

**Unit Tests (test/generate-api-data.test.ts):**
| Test Name | Input | Expected Output |
|-----------|-------|-----------------|
| extractJsDoc parses description | node with JSDoc | `{ description: "..." }` |
| extractJsDoc parses @param tags | node with params | `{ params: [...] }` |
| extractJsDoc handles missing JSDoc | node without JSDoc | `{ description: "", params: [] }` |
| extractFunctions finds exported functions | mock source | StrudelFunction[] |

**Integration Tests (test/integration/):**
| Test Name | Scenario |
|-----------|----------|
| server responds to initialize | Send initialize → receive capabilities |
| completion returns items for .strudel file | Open file, request completion → items |
| hover returns info for known function | Hover over `note` → markdown content |
| hover returns null for unknown word | Hover over `xyz` → null |

**Fixtures (test/fixtures/):**
- `basic.strudel` - Simple pattern: `note("c e g")`
- `chained.strudel` - Method chaining: `note("c").s("piano").lpf(500)`
- `complex.strudel` - Multiple patterns with stack, effects

**Test Commands:**
```bash
pnpm test              # Run all unit tests
pnpm test:watch        # Watch mode
pnpm test:integration  # Integration tests only
pnpm test:coverage     # With coverage report
```

**Runner:** Vitest with `vitest.config.ts`

### E) Commit Plan

**Layer:** Backend/tooling only (no frontend, middletier, or infra)

---

**Phase 1: Project Setup**

| # | Commit | Changes | Tests |
|---|--------|---------|-------|
| 1 | `chore: init project with pnpm` | `package.json`, `pnpm-lock.yaml`, `.gitignore` | - |
| 2 | `chore: add typescript and tsup config` | `tsconfig.json`, `tsup.config.ts` | - |
| 3 | `chore: add biome for lint and format` | `biome.json` | - |
| 4 | `chore: add vitest config` | `vitest.config.ts`, test script in package.json | - |

---

**Phase 2: Types & Core Infrastructure**

| # | Commit | Changes | Tests |
|---|--------|---------|-------|
| 5 | `feat: add core type definitions` | `src/types.ts` (StrudelFunction, Parameter, ApiData) | - |
| 6 | `feat: add LSP server capabilities` | `src/capabilities.ts` | - |
| 7 | `feat: add server initialization` | `src/server.ts` (createServer, initialize, start) | - |

---

**Phase 3: Completion Feature**

| # | Commit | Changes | Tests |
|---|--------|---------|-------|
| 8 | `feat: add getWordAtPosition utility` | `src/services/completion.service.ts` | `getWordAtPosition` tests |
| 9 | `feat: add completion filtering logic` | `src/services/completion.service.ts` | `filterByPrefix` tests |
| 10 | `feat: add completion item mapping` | `src/services/completion.service.ts` | `toCompletionItem` tests |
| 11 | `feat: add getCompletions function` | `src/services/completion.service.ts` | `getCompletions` tests |
| 12 | `feat: add completion handler` | `src/handlers/completion.ts` | - |

---

**Phase 4: Hover Feature**

| # | Commit | Changes | Tests |
|---|--------|---------|-------|
| 13 | `feat: add findFunction utility` | `src/services/hover.service.ts` | `findFunction` tests |
| 14 | `feat: add hover content formatting` | `src/services/hover.service.ts` | `toHoverContent` tests |
| 15 | `feat: add getHoverInfo function` | `src/services/hover.service.ts` | `getHoverInfo` tests |
| 16 | `feat: add hover handler` | `src/handlers/hover.ts` | - |

---

**Phase 5: API Data Generation**

| # | Commit | Changes | Tests |
|---|--------|---------|-------|
| 17 | `feat: add JSDoc extraction` | `scripts/generate-api-data.ts` | `extractJsDoc` tests |
| 18 | `feat: add function extraction from source` | `scripts/generate-api-data.ts` | `extractFunctions` tests |
| 19 | `feat: add JSON output writer` | `scripts/generate-api-data.ts` | - |
| 20 | `chore: generate initial strudel-api.json` | `src/data/strudel-api.json` | - |

---

**Phase 6: Integration & Polish**

| # | Commit | Changes | Tests |
|---|--------|---------|-------|
| 21 | `feat: wire handlers to server` | `src/server.ts` updates | Integration tests |
| 22 | `test: add test fixtures` | `test/fixtures/*.strudel` | - |
| 23 | `docs: add README with usage instructions` | `README.md` | - |

---

**Phase 7: Review & Cleanup**

| # | Commit | Changes | Tests |
|---|--------|---------|-------|
| 24 | `refactor: apply PR review recommendations` | Various files | Ensure tests pass |
| 25 | `chore: remove unnecessary comments` | Various files | - |

---

### F) Final Review Checklist

- [ ] PR review of all changes as if another engineer reviewing
- [ ] Apply recommended changes from PR review
- [ ] Iterate on tests until all passing
- [ ] Remove any unnecessary comments in the code
