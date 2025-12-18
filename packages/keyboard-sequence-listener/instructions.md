# Keyboard Sequence Listener Library - Development Instructions

## Overview

This is a lightweight TypeScript library for detecting keyboard and gamepad input sequences. It's designed to be framework-agnostic, dependency-free, and highly performant (<2KB gzipped).

## Project Structure

```
keyboard-sequence-listener/
├── src/
│   └── index.ts           # Main library source code
├── dist/                  # Compiled output (generated)
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
├── rollup.config.js       # Build configuration
├── README.md              # English documentation
├── README.zh-CN.md        # Chinese documentation
└── CHANGELOG.md           # Version history
```

## Architecture

### Core Components

1. **KeySequenceListener Class** - Main class for creating and managing listeners
2. **Types & Interfaces** - TypeScript definitions for strong typing
3. **Predefined Sequences** - Common sequences like KONAMI_CODE
4. **Utility Functions** - Helper functions like `createKeySequenceListener`
5. **Gamepad Support** - Integration for gamepad/controller input

### Key Design Principles

- **Zero Dependencies**: No external runtime dependencies
- **Browser Only**: Designed for browser environments (checks for `window` and `document`)
- **Event-Driven**: Uses callback patterns for flexibility
- **Memory Safe**: Proper cleanup of listeners and timers
- **TypeScript First**: Full type safety with exported types

## Development Workflow

### Setup

```bash
# Install dependencies
pnpm install

# Start watch mode for development
pnpm dev

# Build for production
pnpm build
```

### Build Process

The library uses **Rollup** to create two output formats:

1. **CommonJS** (`dist/index.js`) - For Node.js compatibility
2. **ES Module** (`dist/index.esm.js`) - For modern bundlers
3. **Type Definitions** (`dist/index.d.ts`) - TypeScript types

Build configuration in [rollup.config.js](rollup.config.js):

- Input: `src/index.ts`
- Plugins: `@rollup/plugin-typescript`
- Source maps: Enabled for debugging
- Declaration files: Generated automatically

## TypeScript Configuration

Target: **ES2015** (for broad browser compatibility)

- Strict mode enabled
- Declaration files generated
- Module resolution: Node

Key compiler options:

```json
{
  "target": "ES2015",
  "module": "ESNext",
  "strict": true,
  "declaration": true
}
```

## Code Organization

### Class Structure

The `KeySequenceListener` class follows this structure:

```typescript
export class KeySequenceListener {
  // 1. Public type definitions (exported separately)
  
  // 2. Private properties
  private sequence: KeySequence;
  private onMatch: () => void;
  private currentIndex: number = 0;
  // ... other state
  
  // 3. Constructor
  constructor(options: KeySequenceListenerOptions) {
    // Initialize all properties
  }
  
  // 4. Public lifecycle methods
  start(): void { }
  stop(): void { }
  reset(): void { }
  destroy(): void { }
  
  // 5. Public utility methods
  getProgress(): number { }
  updateSequence(sequence: KeySequence): void { }
  
  // 6. Private event handlers
  private handleKeyPress(event: KeyboardEvent): void { }
  private handleGamepadButtonPress(buttonIndex: number): void { }
  
  // 7. Private helper methods
  private processInput(key: string, source: string, code?: string): void { }
  private startTimeout(): void { }
  private clearTimeout(): void { }
  private pollGamepads(): void { }
}
```

### Method Naming Conventions

- **Public methods**: Action verbs in camelCase (`start`, `stop`, `reset`, `getProgress`)
- **Private methods**: Descriptive camelCase with context (`handleKeyPress`, `processInput`, `pollGamepads`)
- **Event handlers**: Prefix with `handle` (`handleKeyPress`, `handleGamepadButtonPress`)
- **Callbacks**: Prefix with `on` in options (`onMatch`, `onProgress`, `onMismatch`)

## Core Features Implementation

### 1. Keyboard Input Detection

Uses native `keydown` event listener:

```typescript
private boundHandler: (event: KeyboardEvent) => void;

constructor(options) {
  this.boundHandler = this.handleKeyPress.bind(this);
}

start(): void {
  window.addEventListener('keydown', this.boundHandler);
}

stop(): void {
  window.removeEventListener('keydown', this.boundHandler);
}
```

**Important**: Always bind event handlers in constructor to ensure proper cleanup.

### 2. Gamepad Support

Uses `requestAnimationFrame` polling:

```typescript
private pollGamepads = (): void => {
  if (!this.isListening) return;
  
  const gamepads = navigator.getGamepads?.() ?? [];
  
  // Poll each gamepad's buttons
  for (let i = 0; i < gamepads.length; i++) {
    const gamepad = gamepads[i];
    if (!gamepad) continue;
    
    // Track button state changes
    // Trigger on button down (not held)
  }
  
  this.animationFrameId = requestAnimationFrame(this.pollGamepads);
}
```

**Key considerations**:

- Track previous button states to detect press events (not held)
- Handle analog triggers with threshold (> 0.5)
- Clean up animation frame on stop

### 3. Sequence Matching Logic

Core algorithm in `processInput` method:

```typescript
private processInput(key: string, source: 'keyboard' | 'gamepad', code?: string): void {
  // 1. Trigger onInput callback (if provided)
  
  // 2. Check if key matches expected key
  if (key === expectedKey || code === expectedKey) {
    // Advance progress
    this.currentIndex++;
    
    // Reset and restart timeout
    this.clearTimeout();
    this.startTimeout();
    
    // Trigger onProgress callback
    
    // Check for sequence completion
    if (this.currentIndex === this.sequence.length) {
      this.onMatch();
      this.reset();
      
      // Stop if once mode
      if (this.once) {
        this.stop();
      }
    }
  } else {
    // Handle mismatch
    if (this.currentIndex > 0 && this.resetOnMismatch) {
      this.onMismatch?.();
      this.reset();
      
      // Check if mismatched key starts the sequence
      if (key === this.sequence[0]) {
        this.currentIndex = 1;
        this.startTimeout();
      }
    }
  }
}
```

**Edge cases handled**:

- Ignore keys before sequence starts
- Allow wrong key to start sequence (e.g., pressing 'ArrowUp' twice for Konami Code)
- Reset timeout on each correct key
- Handle both `key` and `code` properties for keyboard events

### 4. Timeout Management

```typescript
private startTimeout(): void {
  if (this.timeout > 0) {
    this.timeoutId = window.setTimeout(() => {
      if (this.onTimeout && this.currentIndex > 0) {
        this.onTimeout();
      }
      this.reset();
    }, this.timeout);
  }
}

private clearTimeout(): void {
  if (this.timeoutId !== null) {
    window.clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }
}
```

**Important**:

- Always clear timeout before starting new one
- Only trigger `onTimeout` if progress > 0
- Reset after timeout fires

### 5. Once Mode

```typescript
if (this.currentIndex === this.sequence.length) {
  this.onMatch();
  this.reset();
  
  if (this.once) {
    this.stop(); // Auto-stop after first match
  }
}
```

Users can restart by calling `start()` again.

## Adding New Features

### Adding a New Callback

1. **Update the interface**:

```typescript
export interface KeySequenceListenerOptions {
  // ... existing callbacks
  onNewEvent?: (data: any) => void;
}
```

1. **Add private property**:

```typescript
export class KeySequenceListener {
  private onNewEvent?: (data: any) => void;
  
  constructor(options: KeySequenceListenerOptions) {
    this.onNewEvent = options.onNewEvent;
  }
}
```

1. **Call at appropriate point**:

```typescript
private someMethod(): void {
  // ... logic
  if (this.onNewEvent) {
    this.onNewEvent(data);
  }
}
```

1. **Document with JSDoc**:

```typescript
/**
 * Callback function to execute when new event occurs
 * @param data - Description of the data
 */
onNewEvent?: (data: any) => void;
```

### Adding a New Method

1. **Add to class** (follow method order):

```typescript
/**
 * Description of what this method does
 * @param param - Parameter description
 * @returns Return value description
 */
public newMethod(param: Type): ReturnType {
  // Validate input
  if (!this.isValid(param)) {
    return defaultValue;
  }
  
  // Implementation
  const result = this.process(param);
  
  return result;
}
```

1. **Write tests** (if test framework is added)

2. **Update README** with usage example

3. **Update CHANGELOG** if breaking change

### Adding a Predefined Sequence

```typescript
export const NEW_SEQUENCE: KeySequence = [
  'KeyN',
  'KeyE',
  'KeyW',
];
```

**Guidelines**:

- Use descriptive SCREAMING_SNAKE_CASE names
- Use `KeySequence` type
- Export for public use
- Document in README with example

## API Design Guidelines

### Callbacks vs Events

**Use callbacks** (current approach):

- Simpler API
- No event emitter dependency
- Better TypeScript support
- Lower bundle size

### Optional Parameters

Always provide sensible defaults:

```typescript
constructor(options: KeySequenceListenerOptions) {
  this.timeout = options.timeout ?? 5000;        // Default: 5 seconds
  this.resetOnMismatch = options.resetOnMismatch ?? true;
  this.once = options.once ?? false;
  this.enableGamepad = options.enableGamepad ?? false;
}
```

### Type Safety

Export all types for consumer use:

```typescript
export type KeySequence = string[];
export interface KeySequenceListenerOptions { ... }
export const GamepadButtons = { ... } as const;
```

## Browser Compatibility

### Required APIs

- `window` and `document` (browser environment)
- `window.addEventListener` / `removeEventListener`
- `setTimeout` / `clearTimeout`
- `navigator.getGamepads` (optional, for gamepad support)
- `requestAnimationFrame` / `cancelAnimationFrame` (for gamepad polling)

### Defensive Checks

Always check for browser APIs:

```typescript
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', this.boundHandler);
}

const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
```

### Target Compatibility

- ES2015+ (supports modern browsers)
- IE11 not supported (no polyfills needed)

## Performance Optimization

### Memory Management

1. **Bind event handlers once** (in constructor):

```typescript
this.boundHandler = this.handleKeyPress.bind(this);
```

1. **Clean up timers**:

```typescript
stop(): void {
  this.clearTimeout();
  if (this.animationFrameId !== null) {
    cancelAnimationFrame(this.animationFrameId);
  }
}
```

1. **Remove event listeners**:

```typescript
window.removeEventListener('keydown', this.boundHandler);
```

### Minimize Allocations

- Reuse arrays for button state tracking
- Use primitive values where possible
- Avoid creating objects in hot paths

### Efficient Polling

For gamepad support:

- Use `requestAnimationFrame` (syncs with display refresh)
- Check `isListening` flag early
- Skip null gamepads
- Only process button state changes

## Testing Strategy

### Manual Testing

Use the playground:

```bash
pnpm dev:playground
```

Test scenarios:

1. Complete sequence successfully
2. Wrong key in middle
3. Timeout triggers
4. Multiple listeners
5. Start/stop/reset methods
6. Once mode
7. Gamepad input (with controller)

### Edge Cases to Test

- Empty sequence (should validate)
- Rapid key presses
- Overlapping sequences
- Multiple instances
- Memory leaks (start/stop repeatedly)
- Gamepad connect/disconnect

## Documentation Standards

### JSDoc Comments

Required for all public APIs:

```typescript
/**
 * Brief description of method
 * 
 * Longer description if needed, explaining behavior,
 * edge cases, or important notes.
 * 
 * @param paramName - Description of parameter
 * @param optionalParam - Description (optional)
 * @returns Description of return value
 * 
 * @example
 * ```typescript
 * const listener = new KeySequenceListener({
 *   sequence: ['KeyA', 'KeyB'],
 *   onMatch: () => console.log('Matched!')
 * });
 * ```
 */
public methodName(paramName: Type, optionalParam?: Type): ReturnType {
  // Implementation
}
```

### README Updates

When adding features, update:

1. **Features list** - Add bullet point
2. **Usage examples** - Show how to use
3. **API documentation** - Document parameters
4. **Both language versions** - English and Chinese

## Publishing Workflow

### Version Management

Uses **Changesets** for version management:

```bash
# After making changes
pnpm changeset

# Follow prompts:
# - Select package(s) to version
# - Select version bump (major/minor/patch)
# - Describe changes

# When ready to release
pnpm version    # Updates version numbers
pnpm release    # Builds and publishes
```

### Semantic Versioning

- **Major (1.0.0 → 2.0.0)**: Breaking changes
- **Minor (1.0.0 → 1.1.0)**: New features (backward compatible)
- **Patch (1.0.0 → 1.0.1)**: Bug fixes

### Pre-publish Checklist

- ✅ All features tested in playground
- ✅ TypeScript compiles without errors
- ✅ Build succeeds (`pnpm build`)
- ✅ README updated (both languages)
- ✅ CHANGELOG updated via changeset
- ✅ Version number is correct
- ✅ No `console.log` statements in code
- ✅ Bundle size is acceptable (<2KB gzipped)

### Build Output

Verify generated files in `dist/`:

```
dist/
├── index.js          # CommonJS
├── index.js.map      # CJS source map
├── index.esm.js      # ES Module
├── index.esm.js.map  # ESM source map
└── index.d.ts        # TypeScript definitions
```

## Common Patterns

### Listening for Custom Sequence

```typescript
const listener = new KeySequenceListener({
  sequence: ['KeyH', 'KeyE', 'KeyL', 'KeyL', 'KeyO'],
  onMatch: () => {
    console.log('User typed HELLO!');
  },
});
listener.start();
```

### With Progress Tracking

```typescript
const listener = new KeySequenceListener({
  sequence: KONAMI_CODE,
  onProgress: (current, total) => {
    console.log(`Progress: ${current}/${total}`);
  },
  onMatch: () => {
    console.log('Konami Code!');
  },
});
```

### With Timeout and Error Handling

```typescript
const listener = new KeySequenceListener({
  sequence: ['KeyA', 'KeyB', 'KeyC'],
  timeout: 3000,
  onMatch: () => console.log('Success!'),
  onMismatch: () => console.log('Wrong key!'),
  onTimeout: () => console.log('Too slow!'),
  resetOnMismatch: true,
});
```

### Once Mode

```typescript
const listener = new KeySequenceListener({
  sequence: ['Digit1', 'Digit2', 'Digit3'],
  onMatch: () => {
    console.log('Triggered once!');
    // Listener auto-stops
  },
  once: true,
});

listener.start();

// To trigger again, restart
listener.start();
```

### Gamepad Support

```typescript
const listener = new KeySequenceListener({
  sequence: KONAMI_CODE,
  enableGamepad: true,
  onInput: (key, source) => {
    console.log(`Input from ${source}: ${key}`);
  },
  onMatch: () => {
    console.log('Konami Code via gamepad!');
  },
});
```

## Troubleshooting

### Issue: Listener not working

**Checks**:

1. Did you call `start()`?
2. Are you in a browser environment?
3. Is the window focused?
4. Check console for errors

### Issue: Memory leak

**Solution**:

- Always call `stop()` or `destroy()` when done
- Remove references: `listener = null`
- Use `once: true` for one-time listeners

### Issue: Gamepad not detected

**Checks**:

1. Is `enableGamepad: true`?
2. Press a button to trigger connection
3. Check `navigator.getGamepads()` in console
4. Verify browser support

### Issue: Wrong keys detected

**Solution**:

- Use `event.code` (physical key) instead of `event.key` (character)
- Example: `KeyA` vs `a` or `A`
- Check keyboard layout differences

## Best Practices

1. **Always Clean Up**: Call `stop()` or `destroy()` when done
2. **Use TypeScript**: Leverage full type safety
3. **Validate Input**: Check sequence is not empty
4. **Provide Defaults**: All optional params should have sensible defaults
5. **Document Everything**: JSDoc for all public APIs
6. **Keep It Simple**: Avoid over-engineering
7. **Zero Dependencies**: Don't add external dependencies
8. **Test in Playground**: Manual testing before release
9. **Update Both READMEs**: Keep English and Chinese in sync
10. **Follow Semver**: Use changesets for version management

## Contributing Guidelines

When contributing to this library:

1. **Maintain backward compatibility** unless major version bump
2. **Keep bundle size small** (<2KB gzipped)
3. **No runtime dependencies** (devDependencies OK)
4. **Add TypeScript types** for all new APIs
5. **Update documentation** (README, JSDoc)
6. **Test thoroughly** in playground
7. **Follow existing code style**
8. **Use meaningful commit messages**

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Rollup Documentation](https://rollupjs.org/)
- [MDN KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
- [MDN Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API)
- [Semantic Versioning](https://semver.org/)
