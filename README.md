# Keyboard Sequence Listener Monorepo

A monorepo for keyboard sequence listener library and playground demo.

## Structure

```
.
├── packages/
│   └── keyboard-sequence-listener/  # Main library
├── playground/                       # Vue3 demo playground
├── package.json
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js >= 16
- pnpm >= 8

### Installation

```bash
pnpm install
```

### Development

```bash
# Build all packages
pnpm build

# Run library in watch mode
pnpm dev:lib

# Run playground dev server
pnpm dev:playground

# Run both in parallel
pnpm dev
```

## Packages

### keyboard-sequence-listener

A lightweight TypeScript library to detect keyboard input sequences (like the Konami Code).

See [packages/keyboard-sequence-listener/README.md](packages/keyboard-sequence-listener/README.md) for detailed API documentation and usage examples.

### playground

A Vue3 demo application showcasing the keyboard-sequence-listener library with interactive examples.

## License

MIT
