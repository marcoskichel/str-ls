# str-lsp

Language Server Protocol implementation for [Strudel](https://strudel.cc/) live coding language.

## Features

- **Autocompletion** - Get suggestions for Strudel functions as you type
- **Hover Documentation** - View function signatures, descriptions, and examples on hover

## Supported File Types

- `.strudel`
- `.str`
- `.std`

## Installation

```bash
pnpm install
pnpm build
```

## Usage

The LSP server uses stdio transport and can be used with any editor that supports LSP.

### Neovim

```lua
vim.api.nvim_create_autocmd("FileType", {
  pattern = { "strudel" },
  callback = function()
    vim.lsp.start({
      name = "str-lsp",
      cmd = { "node", "/path/to/str-lsp/dist/server.js" },
      root_dir = vim.fn.getcwd(),
    })
  end,
})

vim.filetype.add({
  extension = {
    strudel = "strudel",
    str = "strudel",
    std = "strudel",
  },
})
```

### VS Code

Create a VS Code extension or use a generic LSP client extension.

## Development

```bash
pnpm install
pnpm dev          # Watch mode
pnpm test         # Run tests
pnpm test:watch   # Watch mode tests
pnpm lint         # Lint code
pnpm generate-api # Regenerate API data from @strudel/core
```

## Architecture

```
src/
├── server.ts              # LSP server entry point
├── capabilities.ts        # LSP capability declarations
├── types.ts               # Type definitions
├── handlers/
│   ├── completion.ts      # Completion request handler
│   └── hover.ts           # Hover request handler
├── services/
│   ├── completion.service.ts  # Completion logic
│   └── hover.service.ts       # Hover logic
└── data/
    └── strudel-api.json   # Pre-generated API documentation
```

## License

MIT
