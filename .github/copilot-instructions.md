# Copilot Instructions for Keyboard Sequence Listener

## 📚 Quick Navigation

This document provides comprehensive guidelines for the entire project. For detailed information on specific areas:

- 🎯 **Library Development**: See [packages/keyboard-sequence-listener/instructions.md](../packages/keyboard-sequence-listener/instructions.md)
- 🎨 **Playground Development**: See [playground/instructions.md](../../playground/instructions.md)
- 🚀 **GitHub Actions & CI/CD**: See [.github/workflows/instructions.md](./workflows/instructions.md)
- 📝 **Git & Changeset Conventions**: See [.github/git-changeset-guidelines.md](./git-changeset-guidelines.md)

---

## Project Overview

This is a **monorepo** project that contains:
- **keyboard-sequence-listener**: A lightweight TypeScript library for detecting keyboard input sequences (like Konami Code)
- **playground**: A Vue 3 demo application showcasing the library functionality

## Technology Stack

- **Package Manager**: pnpm with workspace support
- **Build Tools**: Rollup (library), Vite (playground)
- **Language**: TypeScript
- **Framework**: Vue 3 (playground only)
- **Version Management**: Changesets

## Code Style & Conventions

### General Guidelines

1. **TypeScript First**: All code should be written in TypeScript with strict type checking
2. **Zero Dependencies**: The core library should remain dependency-free
3. **Browser Compatibility**: Code must work in browser environments (check for `window` and `document`)
4. **Event Handling**: Always clean up event listeners and timers properly
5. **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/) specification
6. **Branching**: Use descriptive branch names with type prefixes (e.g., `feature/`, `fix/`, `docs/`)

**→ For detailed Git conventions, see [Git & Changeset Conventions Guide](./git-changeset-guidelines.md)**

### Naming Conventions

- **Classes**: PascalCase (e.g., `KeySequenceListener`)
- **Interfaces/Types**: PascalCase with descriptive names (e.g., `KeySequenceListenerOptions`)
- **Constants**: SCREAMING_SNAKE_CASE for predefined sequences (e.g., `KONAMI_CODE`)
- **Methods**: camelCase with clear action verbs (e.g., `start()`, `stop()`, `reset()`)
- **Private Methods/Properties**: Prefix with `private` keyword, use camelCase

### Code Structure

```typescript
// Preferred method order in classes:
// 1. Public properties
// 2. Private properties  
// 3. Constructor
// 4. Public methods (lifecycle methods first: start, stop, reset)
// 5. Private methods
// 6. Getters/Setters
```

## Library Development Guidelines

### Core Library (`packages/keyboard-sequence-listener`)

1. **API Design**:
   - Keep the API simple and intuitive
   - Provide sensible defaults for optional parameters
   - Use callback patterns for event handling
   - Support both keyboard and gamepad inputs

2. **Error Handling**:
   - Validate sequence inputs
   - Handle edge cases (empty sequences, duplicate listeners)
   - Provide meaningful error messages

3. **Performance**:
   - Minimize memory allocation in hot paths
   - Clean up resources (timers, event listeners) properly
   - Use efficient data structures

4. **Documentation**:
   - Add JSDoc comments to all public APIs
   - Include usage examples in comments
   - Document parameter constraints and return values

**→ For comprehensive library development details, see [Library Development Guide](../packages/keyboard-sequence-listener/instructions.md)**

This guide covers:
- Complete architecture explanation
- Build process and TypeScript configuration
- Core features implementation details
- Adding new features and predefined sequences
- Browser compatibility requirements
- Performance optimization strategies
- Publishing workflow with Changesets

### Example Code Pattern

```typescript
/**
 * Description of what this method does
 * @param paramName - Description of parameter
 * @returns Description of return value
 */
public methodName(paramName: Type): ReturnType {
  // Validate input
  if (!this.isValid(paramName)) {
    return defaultValue;
  }
  
  // Main logic
  const result = this.process(paramName);
  
  // Clean up if needed
  this.cleanup();
  
  return result;
}
```

## Playground Development Guidelines

### Vue 3 Specific

1. **Composition API**: Use `<script setup>` syntax
2. **Lifecycle Management**: Always clean up listeners in `onUnmounted`
3. **Reactivity**: Use `ref` for primitive values, `reactive` for objects
4. **Component Structure**:
   ```vue
   <script setup lang="ts">
   // 1. Imports
   // 2. Props/Emits
   // 3. Refs/Reactive state
   // 4. Lifecycle hooks
   // 5. Methods
   // 6. Watchers
   </script>

   <template>
   <!-- Template code -->
   </template>

   <style scoped>
   /* Component styles */
   </style>
   ```

**→ For comprehensive playground development details, see [Playground Development Guide](../../playground/instructions.md)**

This guide covers:
- Complete project structure
- Development workflow (dev server, build, preview)
- Vue 3 Composition API best practices
- TypeScript guidelines
- Memory management patterns
- Common demo patterns with code examples
- Styling guidelines and animations
- Debugging and testing checklist
- Performance considerations

## Development Commands

### Library Development

```bash
# Install dependencies
pnpm install

# Development mode (watch for changes)
pnpm dev:lib

# Build library
pnpm build:lib

# View built output
ls packages/keyboard-sequence-listener/dist/
```

### Playground Development

```bash
# Start dev server
pnpm dev:playground

# Build playground
pnpm build:playground

# Preview production build
cd playground && pnpm preview
```

### Version Management

```bash
# Create a changeset
pnpm changeset

# Check pending changesets
pnpm changeset status

# Version packages (auto-called by CI)
pnpm version

# Release to NPM (auto-called by CI)
pnpm release
```

### Running All

```bash
# Install all dependencies
pnpm install

# Dev both library and playground in parallel
pnpm dev

# Build both library and playground
pnpm build
```

## CI/CD & Release Guidelines

### Automated Workflows

We use **GitHub Actions** for continuous integration and deployment:

1. **Deploy Workflow** - Automatically deploys playground to GitHub Pages on every push to `main`
2. **Release Workflow** - Manages package versioning and NPM publishing using Changesets

### Changesets for Version Management

- Create a changeset for every user-facing change: `pnpm changeset`
- Choose version bump: **patch** (bug fix), **minor** (new feature), **major** (breaking change)
- Semantic versioning: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)

**→ For detailed CI/CD and workflow instructions, see [GitHub Actions Guide](./workflows/instructions.md)**

This guide covers:
- Deploy workflow setup and configuration
- NPM publishing with Changesets
- Manual publishing (fallback)
- Workflow modification and customization
- Branch protection rules
- Monitoring and debugging
- Troubleshooting common issues

**→ For version control and release process, see [Git & Changeset Conventions](./git-changeset-guidelines.md)**

This guide covers:
- Conventional Commits specification
- Branch naming conventions
- Pull request guidelines and templates
- Changeset creation and management
- Semantic versioning strategy
- 6 common workflows with step-by-step guides
- Best practices summary
- Troubleshooting common Git issues

## Common Tasks

### 1. Adding a New Feature to the Library

**Process**:
1. Create a feature branch: `git checkout -b feature/my-feature`
2. Update TypeScript interfaces first
3. Implement the feature in the main class
4. Add JSDoc documentation
5. Test in the playground
6. Commit with conventional message: `git commit -m "feat: add my feature"`
7. Create changeset: `pnpm changeset` (select **minor**)
8. Push and create PR

**→ See [Git Workflow](./git-changeset-guidelines.md#workflow-1-adding-a-new-feature) for complete step-by-step guide**

### 2. Fixing a Bug

**Process**:
1. Create fix branch: `git checkout -b fix/bug-name`
2. Fix the bug and test thoroughly
3. Commit: `git commit -m "fix: description of fix"`
4. Create changeset: `pnpm changeset` (select **patch**)
5. Push and create PR

**→ See [Git Workflow](./git-changeset-guidelines.md#workflow-2-fixing-a-bug) for complete step-by-step guide**

### 3. Making Breaking Changes

**Process**:
1. Create branch: `git checkout -b refactor/breaking-change`
2. Update API and implementation
3. Commit: `git commit -m "refactor!: description\n\nBREAKING CHANGE: explain change"`
4. Update README with migration guide
5. Create changeset: `pnpm changeset` (select **major**)
6. Push and create PR

**→ See [Git Workflow](./git-changeset-guidelines.md#workflow-3-breaking-change) for complete step-by-step guide**

### 4. Updating the Playground

**Process**:
1. Create branch: `git checkout -b feat/playground-update`
2. Update playground components
3. Commit: `git commit -m "feat(playground): update demo"`
4. No changeset needed (playground is in ignore list)
5. Push PR - will auto-deploy to GitHub Pages

**→ See [Git Workflow](./git-changeset-guidelines.md#workflow-5-playground-updates) for complete step-by-step guide**

### 5. Production Hotfix

**Process**:
1. Create hotfix from main: `git checkout -b hotfix/critical-issue`
2. Fix critical issue
3. Commit: `git commit -m "fix: urgent fix description"`
4. Create changeset: `pnpm changeset` (select **patch**)
5. Fast-track review and merge
6. Version PR published immediately

**→ See [Git Workflow](./git-changeset-guidelines.md#workflow-6-hotfix-for-production) for complete step-by-step guide**

## File Organization

- `/packages/keyboard-sequence-listener/src/index.ts` - Main library code
- `/packages/keyboard-sequence-listener/instructions.md` - Library development guide
- `/playground/src/components/` - Demo components
- `/playground/instructions.md` - Playground development guide
- `/packages/keyboard-sequence-listener/README.md` - Library documentation
- `/.github/workflows/instructions.md` - GitHub Actions and CI/CD guide
- `/.github/git-changeset-guidelines.md` - Git and Changeset conventions
- Root `package.json` - Workspace scripts

## Important Notes

- **Backward Compatibility**: When adding new features, maintain compatibility with existing API
- **File Size**: Keep the library lightweight (<2KB gzipped)
- **TypeScript Types**: Export all types for consumer use
- **Event Cleanup**: Always remove event listeners in `stop()` and `destroy()` methods
- **Documentation**: Update both English and Chinese README files

## Testing Considerations

When adding new features, consider:
1. **Edge Cases**: Empty sequences, invalid keys, rapid input
2. **Memory Leaks**: Ensure proper cleanup of listeners and timers
3. **Browser Compatibility**: Test in different browsers
4. **Gamepad Support**: Verify gamepad input handling

## Additional Resources

- 📖 [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- 📦 [Rollup Documentation](https://rollupjs.org/)
- 🎨 [Vue 3 Documentation](https://vuejs.org/)
- ⚡ [Vite Documentation](https://vitejs.dev/)
- 🔄 [Changesets Documentation](https://github.com/changesets/changesets)
- 📝 [Conventional Commits](https://www.conventionalcommits.org/)
- 🏷️ [Semantic Versioning](https://semver.org/)
- 🚀 [GitHub Actions](https://docs.github.com/en/actions)
