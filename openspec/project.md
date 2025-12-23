# Project Context

## Purpose
This project is a monorepo containing a keyboard sequence listener library and a playground application.
- **Library**: `@daye-cli/keyboard-sequence-listener` - A lightweight, dependency-free TypeScript library to detect keyboard input sequences (e.g., Konami Code).
- **Playground**: A Vue 3 application to demonstrate and test the library.

## Tech Stack
- **Package Manager**: pnpm (using workspaces)
- **Language**: TypeScript
- **Library Build Tool**: Rollup
- **Application Framework**: Vue 3
- **Application Build Tool**: Vite
- **Versioning**: Changesets

## Project Conventions

### Code Style
- **TypeScript**: Strict type checking enabled.
- **Modules**: ESM preferred (`type: "module"`).
- **Naming**: PascalCase for classes/components, camelCase for methods/variables.

### Architecture Patterns
- **Monorepo Structure**:
  - `packages/`: Library packages (currently `keyboard-sequence-listener`).
  - `playground/`: Demo application consuming the library via workspace protocol.
- **Library**:
  - Source: `src/index.ts`
  - Output: `dist/` (ESM and CJS formats)
- **Playground**:
  - Source: `src/` (Vue components)

### Testing Strategy
- **Manual Testing**: Primary testing via the `playground` application.
- **Unit Testing**: (Not currently set up, but library structure supports it)

### Git Workflow
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
- **Versioning**: Use `changeset` for version management and changelog generation.
- **Branches**: Feature branch workflow (e.g., `feature/gamepad-support`).

## Domain Context
- **Keyboard Sequences**: Detecting ordered sequences of key presses.
- **Konami Code**: The default example sequence (Up, Up, Down, Down, Left, Right, Left, Right, B, A).
- **Inputs**: Supports Keyboard events and Gamepad inputs.

## Important Constraints
- **Library Size**: Must remain lightweight (<2KB gzipped).
- **Dependencies**: The core library must be zero-dependency.
- **Browser Support**: Modern browsers (ES2015+).

## External Dependencies
- **Vue**: Used for the playground UI.
- **Vite/Rollup**: Build tools.
