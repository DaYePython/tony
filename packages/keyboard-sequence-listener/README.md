# Keyboard Sequence Listener

A lightweight TypeScript library to detect keyboard input sequences (like the Konami Code: ↑↑↓↓←→←→BA).

## Installation

```bash
npm install keyboard-sequence-listener
```

## Usage

### Basic Example

```typescript
import { createKeySequenceListener, KONAMI_CODE } from 'keyboard-sequence-listener';

// Listen for the Konami Code
const listener = createKeySequenceListener({
  sequence: KONAMI_CODE,
  onMatch: () => {
    console.log('Konami Code activated! 🎮');
  },
});

// Stop listening when needed
listener.stop();
```

### Custom Sequence

```typescript
import { KeySequenceListener } from 'keyboard-sequence-listener';

const listener = new KeySequenceListener({
  sequence: ['h', 'e', 'l', 'l', 'o'],
  onMatch: () => {
    alert('You typed "hello"!');
  },
  timeout: 3000, // 3 seconds to complete the sequence
  resetOnMismatch: true, // Reset on wrong key
});

listener.start();
```

### Once Mode (Listen Only Once)

```typescript
import { createKeySequenceListener } from 'keyboard-sequence-listener';

// This listener will automatically stop after the first match
const listener = createKeySequenceListener({
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

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { createKeySequenceListener, KONAMI_CODE } from 'keyboard-sequence-listener';

let listener;

onMounted(() => {
  listener = createKeySequenceListener({
    sequence: KONAMI_CODE,
    onMatch: () => {
      console.log('Easter egg found!');
    },
  });
});

onUnmounted(() => {
  listener?.destroy();
});
</script>
```

## API

### `KeySequenceListener`

#### Constructor Options

- `sequence: string[]` - Array of keys to listen for (e.g., `['ArrowUp', 'ArrowDown', 'a']`)
- `onMatch: () => void` - Callback when sequence is matched
- `timeout?: number` - Time window in ms to complete sequence (default: 5000)
- `resetOnMismatch?: boolean` - Reset on wrong key (default: true)
- `once?: boolean` - Auto-stop listening after first match (default: false)

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
