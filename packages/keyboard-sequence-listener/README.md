# Keyboard Sequence Listener

A lightweight TypeScript library to detect keyboard input sequences (like the Konami Code: ↑↑↓↓←→←→BA).

## Features

✨ **Simple API** - Easy to use with TypeScript support  
🎯 **Progress Tracking** - Get callbacks for each matched key  
⏱️ **Timeout Support** - Set time limits for sequence completion  
🔄 **Flexible Control** - Start, stop, reset, and destroy listeners  
🎮 **Predefined Sequences** - Includes Konami Code and more  
📦 **Lightweight** - Zero dependencies, <2KB gzipped

## Installation

```bash
npm install @daye-cli/keyboard-sequence-listener
# or
pnpm add @daye-cli/keyboard-sequence-listener
# or
yarn add @daye-cli/keyboard-sequence-listener
```

## Usage

### Basic Example

```typescript
import { KeySequenceListener, KONAMI_CODE } from '@daye-cli/keyboard-sequence-listener';

// Listen for the Konami Code
const listener = new KeySequenceListener({
  sequence: KONAMI_CODE,
  onMatch: () => {
    console.log('Konami Code activated! 🎮');
  },
});

listener.start();

// Stop listening when needed
listener.stop();
```

### Custom Sequence with Progress Tracking

```typescript
import { KeySequenceListener } from '@daye-cli/keyboard-sequence-listener';

const listener = new KeySequenceListener({
  sequence: ['KeyH', 'KeyE', 'KeyL', 'KeyL', 'KeyO'],
  onMatch: () => {
    console.log('You typed "HELLO"!');
  },
  onProgress: (key, index, sequence) => {
    console.log(`Progress: ${index + 1}/${sequence.length} - Key: ${key}`);
  },
  onMismatch: (key, expected) => {
    console.log(`Wrong key! Got ${key}, expected ${expected}`);
  },
  onTimeout: () => {
    console.log('Sequence timeout - too slow!');
  },
  timeout: 3000, // 3 seconds to complete the sequence
});KeySequenceListener } from '@daye-cli/keyboard-sequence-listener';

// This listener will automatically stop after the first match
const listener = new KeySequenceListener({
  sequence: ['Digit1', 'Digit2', 'Digit3'],
  onMatch: () => {
    alert('Sequence matched! Listener has stopped.');
  },
  once: true, // Auto-stop after first match
});

listener.start();

// To restart, simplyner({
  sequence: ['1', '2', '3'],
  onMatch: () => {
    alert('Sequence matched! Listener has stopped.');
  },
  once: true, // Auto-stop after first match
});

// To restart, create a new listener or call start() again
listener.start();
```

### Vue 3 Example
 lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { KeySequenceListener, KONAMI_CODE } from '@daye-cli/keyboard-sequence-listener';

const progress = ref(0);
const message = ref('');
let listener: KeySequenceListener;

onMounted(() => {
  listener = new KeySequenceListener({
    sequence: KONAMI_CODE,
    onMatch: () => {
      message.value = '🎮 Konami Code Activated!';
    },
    onProgress: (key, index, sequence) => {
      progress.value = ((index + 1) / sequence.length) * 100;
    },
    onMismatch: () => {
      progress.value = 0;
      message.value = '❌ Wrong key!';
    },
  });
  
  listener.start();
});

onUnmounted(() => {
  listener?.destroy();
});
```typescript
interface KeySequenceListenerOptions {
  sequence: string[];           // Array of key codes (e.g., ['ArrowUp', 'KeyA'])
  onMatch: () => void;          // Called when sequence is completed
  onProgress?: (key: string, index: number, sequence: string[]) => void; // Called on each correct key
  onMismatch?: (key: string, expected: string) => void; // Called on wrong key
  onTimeout?: () => void;       // Called when sequence times out
  timeout?: number;             // Time window in ms (default: 5000)
  once?: boolean;               // Auto-stop after first match (default: false)
}
```

**Key Parameters:**

- `sequence` - Array of keyboard event codes (use `event.code` format like `'KeyA'`, `'ArrowUp'`, `'Digit1'`)
- `onMatch` - Required callback triggered when full sequence matches
- `onProgress` - Optional callback for each successful key press (useful for progress bars)
- `onMismatch` - Optional callback when user presses wrong key (only after sequence starts)
- `onTimeout` - Optional callback when too much time passes between keys
- `timeout` - Milliseconds before sequence auto-resets (default: 5000ms)
- `once` - If true, listener stops automatically after first match

#### Methods

- `start()` - Start listening for keyboard events
- `stop()` - Stop listening (preserves progress)
- `reset()` - Reset progress to beginning
- `destroy()` - Clean up and remove all event listeners

### Predefined Sequences

```typescript
import { KONAMI_CODE } from '@daye-cli/keyboard-sequence-listener';

// KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
//                'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
//                'KeyB', 'KeyA']
```

**Available Constants:**

- `KONAMI_CODE` - The classic ↑↑↓↓←→←→BA sequencefirst match (default: false)
Key Code Reference

Use `event.code` format for keyboard keys:

| Key Type | Example Codes |
|----------|---------------|
| Letters | `KeyA`, `KeyB`, ... `KeyZ` |
| Numbers | `Digit0`, `Digit1`, ... `Digit9` |
| Arrows | `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` |
| Special | `Enter`, `Space`, `Escape`, `Tab` |

See [MDN KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code) for full reference.

## Browser Support

Works in all modern browsers that support:
- `KeyboardEvent.code` (Chrome 48+, Firefox 38+, Safari 10.1+)
- ES2015+ (or use with transpilation)

## Contributing

Issues and pull requests are welcome! Visit [GitHub repository](https://github.com/DaYePython/tony).

## 
#### Methods

- `start()` - Start listening
- `stop()` - Stop listening
- `reset()` - Reset current progress
- `getProgress()` - Get current position in sequence
- `updateSequence(sequence)` - Change the target sequence
- `destroy()` - Clean up and remove listeners

### Helper Functions

- `createKeySequenceListener(options)` - Creates and starts a listener

### Predefined Sequences

- `KONAMI_CODE` - ↑↑↓↓←→←→BA
- `KONAMI_CODE_WITH_ENTER` - ↑↑↓↓←→←→BA + Enter

## License

MIT
