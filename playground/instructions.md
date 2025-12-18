# Playground Development Instructions

## Overview

The playground is a Vue 3 demo application that showcases the `keyboard-sequence-listener` library's functionality. It provides interactive examples of various features including keyboard sequences, gamepad support, progress tracking, and different listening modes.

## Project Structure

```
playground/
├── src/
│   ├── App.vue              # Main application component
│   ├── main.ts              # Application entry point
│   ├── style.css            # Global styles
│   ├── components/
│   │   └── KeySequenceDemo.vue  # Main demo component
│   └── assets/              # Static assets
├── public/                  # Public assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
└── package.json             # Dependencies and scripts
```

## Technology Stack

- **Framework**: Vue 3.5+ with Composition API
- **Build Tool**: Vite 7.x
- **Language**: TypeScript 5.9+
- **Package Manager**: pnpm (workspace)
- **Type Checking**: vue-tsc

## Development Workflow

### Starting Development Server

```bash
# From root directory
pnpm dev:playground

# Or from playground directory
cd playground && pnpm dev
```

### Building for Production

```bash
# From root directory
pnpm build:playground

# Or from playground directory
cd playground && pnpm build
```

### Preview Production Build

```bash
cd playground && pnpm preview
```

## Vue 3 Coding Standards

### Component Structure

Always follow this structure in Vue components:

```vue
<script setup lang="ts">
// 1. Import statements
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { KeySequenceListener, KONAMI_CODE } from '@daye-cli/keyboard-sequence-listener'

// 2. Props and emits (if any)
// const props = defineProps<{ ... }>()
// const emit = defineEmits<{ ... }>()

// 3. Reactive state
const progress = ref(0)
const activated = ref(false)

// 4. Computed properties
const progressPercentage = computed(() => {
  return (progress.value / sequence.value.length) * 100
})

// 5. Methods
const resetProgress = () => {
  // Implementation
}

// 6. Lifecycle hooks
onMounted(() => {
  // Setup code
})

onUnmounted(() => {
  // Cleanup code
})
</script>

<template>
  <!-- Template code -->
</template>

<style scoped>
/* Component styles */
</style>
```

### Composition API Best Practices

1. **Use `<script setup>`**: It's more concise and has better TypeScript support
2. **Reactive References**:
   - Use `ref()` for primitive values: `const count = ref(0)`
   - Use `reactive()` for objects: `const state = reactive({ count: 0 })`
3. **Computed Properties**: Always use `computed()` for derived state
4. **Lifecycle Hooks**: Import only the hooks you need

### TypeScript Guidelines

1. **Type Annotations**: Always provide types for component props, emits, and complex objects
2. **Ref Types**: Specify types for refs when TypeScript cannot infer them:

   ```typescript
   const listener = ref<KeySequenceListener | null>(null)
   const history = ref<string[]>([])
   ```

3. **Avoid `any`**: Use proper types or `unknown` when type is truly dynamic

## Working with Keyboard Sequence Listener

### Basic Setup Pattern

```typescript
import { onMounted, onUnmounted, ref } from 'vue'
import { KeySequenceListener, KONAMI_CODE } from '@daye-cli/keyboard-sequence-listener'

const progress = ref(0)
const activated = ref(false)
let listener: KeySequenceListener | null = null

onMounted(() => {
  listener = new KeySequenceListener({
    sequence: KONAMI_CODE,
    onMatch: () => {
      activated.value = true
    },
    onProgress: (current, total) => {
      progress.value = current
    },
    onMismatch: () => {
      progress.value = 0
    },
  })
  listener.start()
})

onUnmounted(() => {
  // CRITICAL: Always cleanup listeners
  listener?.stop()
  listener = null
})
```

### Memory Management

**CRITICAL**: Always clean up listeners in `onUnmounted`:

```typescript
onUnmounted(() => {
  konamiListener?.stop()
  customListener?.stop()
  gamepadListener?.stop()
  
  // Remove any window event listeners
  if (handleKeyDown) {
    window.removeEventListener('keydown', handleKeyDown)
  }
  if (handleGamepadConnect) {
    window.removeEventListener('gamepadconnected', handleGamepadConnect)
  }
  if (handleGamepadDisconnect) {
    window.removeEventListener('gamepaddisconnected', handleGamepadDisconnect)
  }
  
  // Nullify references
  konamiListener = null
  customListener = null
  gamepadListener = null
})
```

### Common Patterns

#### 1. Progress Tracking with Visual Feedback

```typescript
const progress = ref(0)
const progressPercentage = computed(() => {
  return (progress.value / sequence.length) * 100
})

const listener = new KeySequenceListener({
  sequence: ['KeyA', 'KeyB', 'KeyC'],
  onProgress: (current, total) => {
    progress.value = current
  },
  onMatch: () => {
    // Success animation
  },
})
```

```vue
<template>
  <div class="progress-bar">
    <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
  </div>
  <p>Progress: {{ progress }} / {{ sequence.length }}</p>
</template>
```

#### 2. Error Handling with Animations

```typescript
const errorShaking = ref(false)

const triggerErrorShake = () => {
  errorShaking.value = true
  setTimeout(() => {
    errorShaking.value = false
  }, 500)
}

const listener = new KeySequenceListener({
  sequence: KONAMI_CODE,
  onMismatch: () => {
    triggerErrorShake()
    progress.value = 0
  },
})
```

```vue
<template>
  <div class="demo" :class="{ 'error-shake': errorShaking }">
    <!-- Content -->
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.error-shake {
  animation: shake 0.5s ease-in-out;
}
</style>
```

#### 3. Once Mode with Restart Capability

```typescript
const onceActivated = ref(false)
const onceListenerActive = ref(true)
let onceListener: KeySequenceListener | null = null

const restartOnceListener = () => {
  onceActivated.value = false
  onceListenerActive.value = true
  
  // Destroy old listener
  onceListener?.destroy()
  
  // Create new listener
  onceListener = new KeySequenceListener({
    sequence: ['1', '2', '3'],
    onMatch: () => {
      onceActivated.value = true
      onceListenerActive.value = false
    },
    once: true,
  })
  onceListener.start()
}
```

#### 4. Gamepad Support

```typescript
const gamepadConnected = ref(false)
const gamepadProgress = ref(0)
let gamepadListener: KeySequenceListener | null = null

onMounted(() => {
  // Gamepad connection handlers
  const handleGamepadConnect = (event: GamepadEvent) => {
    gamepadConnected.value = true
    console.log('Gamepad connected:', event.gamepad)
  }
  
  const handleGamepadDisconnect = (event: GamepadEvent) => {
    gamepadConnected.value = false
    console.log('Gamepad disconnected:', event.gamepad)
  }
  
  window.addEventListener('gamepadconnected', handleGamepadConnect)
  window.addEventListener('gamepaddisconnected', handleGamepadDisconnect)
  
  // Create gamepad listener
  gamepadListener = new KeySequenceListener({
    sequence: KONAMI_CODE,
    enableGamepad: true,
    onProgress: (current, total) => {
      gamepadProgress.value = current
    },
    onMatch: () => {
      gamepadActivated.value = true
    },
  })
  gamepadListener.start()
})
```

## Styling Guidelines

### Scoped Styles

Always use `scoped` styles to prevent CSS leakage:

```vue
<style scoped>
.demo {
  /* Component-specific styles */
}
</style>
```

### CSS Class Naming

- Use kebab-case: `.progress-bar`, `.key-history`
- Use BEM methodology for complex components:
  - Block: `.card`
  - Element: `.card__header`
  - Modifier: `.card--highlighted`

### Responsive Design

Consider mobile and desktop views:

```css
.demo {
  padding: 2rem;
}

@media (max-width: 768px) {
  .demo {
    padding: 1rem;
  }
}
```

### Animation Best Practices

1. Use CSS animations for performance
2. Keep animations short (< 600ms)
3. Use `ease-in-out` for natural motion
4. Clean up animation classes with `setTimeout`

## Common Tasks

### Adding a New Demo Section

1. **Create a new card in KeySequenceDemo.vue**:

```vue
<div class="card new-feature">
  <h2>New Feature</h2>
  <p>Description...</p>
  <div v-if="newFeatureActivated" class="success-message">
    ✅ Feature activated!
  </div>
</div>
```

1. **Add reactive state**:

```typescript
const newFeatureActivated = ref(false)
let newFeatureListener: KeySequenceListener | null = null
```

1. **Initialize listener in `onMounted`**:

```typescript
onMounted(() => {
  newFeatureListener = new KeySequenceListener({
    sequence: ['KeyN', 'KeyE', 'KeyW'],
    onMatch: () => {
      newFeatureActivated.value = true
    },
  })
  newFeatureListener.start()
})
```

1. **Clean up in `onUnmounted`**:

```typescript
onUnmounted(() => {
  newFeatureListener?.stop()
  newFeatureListener = null
})
```

### Adding New Predefined Sequences

To test a new predefined sequence from the library:

```typescript
import { KeySequenceListener, YOUR_NEW_SEQUENCE } from '@daye-cli/keyboard-sequence-listener'

const listener = new KeySequenceListener({
  sequence: YOUR_NEW_SEQUENCE,
  onMatch: () => {
    console.log('Sequence matched!')
  },
})
```

### Debugging Tips

1. **Use Vue DevTools**: Install the Vue DevTools browser extension
2. **Console Logging**: Use `onInput` callback to see all key presses:

   ```typescript
   onInput: (key, source) => {
     console.log(`Key pressed: ${key} from ${source}`)
   }
   ```

3. **Progress Tracking**: Display current progress in the UI
4. **Gamepad Debugging**: Use `navigator.getGamepads()` in console to inspect gamepad state

## Testing Checklist

When adding new features, test:

- ✅ Sequence completes successfully
- ✅ Mismatch handling works correctly
- ✅ Timeout triggers as expected
- ✅ Progress updates accurately
- ✅ Animations play smoothly
- ✅ Cleanup happens on unmount (check browser DevTools for memory leaks)
- ✅ Responsive design on mobile
- ✅ Gamepad input (if applicable)
- ✅ Multiple listeners work simultaneously

## Performance Considerations

1. **Debounce Rapid Updates**: If updating state frequently, consider debouncing
2. **Limit History Length**: Keep key history arrays bounded (e.g., max 10 items)
3. **Use `v-show` vs `v-if`**: For frequently toggled elements, use `v-show`
4. **Avoid Heavy Computations in Templates**: Move to computed properties

## Common Pitfalls

### ❌ Don't: Forget to clean up listeners

```typescript
onMounted(() => {
  const listener = new KeySequenceListener({...})
  listener.start()
})
// Missing onUnmounted cleanup!
```

### ✅ Do: Always clean up

```typescript
let listener: KeySequenceListener | null = null

onMounted(() => {
  listener = new KeySequenceListener({...})
  listener.start()
})

onUnmounted(() => {
  listener?.stop()
  listener = null
})
```

### ❌ Don't: Modify ref value directly

```typescript
const history = ref<string[]>([])
history = [...history.value, newKey] // Wrong!
```

### ✅ Do: Update ref.value

```typescript
const history = ref<string[]>([])
history.value = [...history.value, newKey]
// Or use array methods:
history.value.push(newKey)
```

### ❌ Don't: Create listeners in render cycle

```typescript
// This creates a new listener on every render!
const listener = new KeySequenceListener({...})
```

### ✅ Do: Create listeners in lifecycle hooks

```typescript
let listener: KeySequenceListener | null = null

onMounted(() => {
  listener = new KeySequenceListener({...})
  listener.start()
})
```

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Keyboard Sequence Listener README](../packages/keyboard-sequence-listener/README.md)

## Need Help?

- Check the main library documentation for API details
- Review the existing `KeySequenceDemo.vue` for examples
- Ensure you're following the Vue 3 Composition API patterns
- Verify cleanup code is present in `onUnmounted`
