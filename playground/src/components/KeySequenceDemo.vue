<template>
  <div class="demo" :class="{ 'error-shake': errorShaking, 'timeout-shake': timeoutShaking }">
    <div class="card">
      <h2>Try the Konami Code!</h2>
      <p class="instruction">
        Press: <kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>B</kbd> <kbd>A</kbd>
      </p>
      
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <p class="progress-text">Progress: {{ progress }} / {{ sequence.length }}</p>

      <div v-if="activated" class="success-message">
        <h3>🎉 Konami Code Activated!</h3>
        <p>You unlocked the secret!</p>
      </div>

      <div class="key-history">
        <h3>Recent Keys:</h3>
        <div class="keys">
          <span v-for="(key, index) in keyHistory" :key="index" class="key-item">
            {{ formatKey(key) }}
          </span>
        </div>
      </div>
    </div>

    <div class="card custom-sequence">
      <h2>Custom Sequence</h2>
      <p>Try typing: <strong>HELLO</strong></p>
      <div v-if="customActivated" class="success-message">
        ✅ You typed "HELLO"!
      </div>
    </div>

    <div class="card once-mode">
      <h2>Once Mode 🎯</h2>
      <p>Press: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> (triggers only once)</p>
      <div v-if="onceActivated" class="success-message">
        🎯 Triggered! This listener has stopped.
      </div>
      <div v-if="!onceListenerActive" class="info-message">
        ⚠️ Listener stopped after first match
      </div>
      <button @click="restartOnceListener" :disabled="onceListenerActive">
        Restart Once Listener
      </button>
    </div>

    <div class="card gamepad-mode">
      <h2>Gamepad Mode 🎮</h2>
      <div class="status-indicator" :class="{ connected: gamepadConnected }">
        Status: {{ gamepadConnected ? 'Connected' : 'Disconnected (Press any button)' }}
      </div>
      <p>Press: <kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>B</kbd> <kbd>A</kbd></p>
      
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (gamepadProgress / 10) * 100 + '%' }"></div>
      </div>
      
      <div v-if="gamepadActivated" class="success-message">
        🎮 Gamepad Konami Code Activated!
      </div>

      <div class="key-history">
        <h3>Recent Gamepad Inputs:</h3>
        <div class="keys">
          <span v-for="(key, index) in gamepadHistory" :key="index" class="key-item">
            {{ key }}
          </span>
        </div>
      </div>
    </div>

    <div class="card controls">
      <h3>Controls</h3>
      <button @click="resetProgress">Reset Progress</button>
      <button @click="toggleListener">{{ isListening ? 'Stop' : 'Start' }} Listener</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { KeySequenceListener, KONAMI_CODE, GamepadButtons } from '@daye-cli/keyboard-sequence-listener'

const sequence = ref(KONAMI_CODE)
const progress = ref(0)
const activated = ref(false)
const customActivated = ref(false)
const onceActivated = ref(false)
const gamepadActivated = ref(false)
const gamepadConnected = ref(false)
const gamepadProgress = ref(0)
const gamepadHistory = ref<string[]>([])
const onceListenerActive = ref(true)
const keyHistory = ref<string[]>([])
const isListening = ref(true)
const errorShaking = ref(false)
const timeoutShaking = ref(false)

let konamiListener: KeySequenceListener | null = null
let customListener: KeySequenceListener | null = null
let onceListener: KeySequenceListener | null = null
let gamepadListener: KeySequenceListener | null = null
let handleKeyDown: ((event: KeyboardEvent) => void) | null = null
let handleGamepadConnect: ((event: GamepadEvent) => void) | null = null
let handleGamepadDisconnect: ((event: GamepadEvent) => void) | null = null

const updateGamepadHistory = (key: string) => {
  gamepadHistory.value.unshift(key)
  if (gamepadHistory.value.length > 10) {
    gamepadHistory.value.pop()
  }
}

const progressPercentage = computed(() => {
  return (progress.value / sequence.value.length) * 100
})

const formatKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
  }
  return keyMap[key] || key.toUpperCase()
}

const updateKeyHistory = (key: string) => {
  keyHistory.value.unshift(key)
  if (keyHistory.value.length > 10) {
    keyHistory.value.pop()
  }
}

const triggerErrorShake = () => {
  errorShaking.value = true
  setTimeout(() => {
    errorShaking.value = false
  }, 500)
}

const triggerTimeoutShake = () => {
  timeoutShaking.value = true
  setTimeout(() => {
    timeoutShaking.value = false
  }, 600)
}

const resetProgress = () => {
  if (konamiListener) {
    konamiListener.reset()
    progress.value = 0
    activated.value = false
  }
  if (customListener) {
    customListener.reset()
    customActivated.value = false
  }
  if (gamepadListener) {
    gamepadListener.reset()
    gamepadActivated.value = false
    gamepadProgress.value = 0
  }
}

const toggleListener = () => {
  if (isListening.value) {
    konamiListener?.stop()
    customListener?.stop()
    onceListener?.stop()
    gamepadListener?.stop()
    if (handleKeyDown) {
      window.removeEventListener('keydown', handleKeyDown)
    }
  } else {
    konamiListener?.start()
    customListener?.start()
    gamepadListener?.start()
    if (onceListenerActive.value) {
      onceListener?.start()
    }
    if (handleKeyDown) {
      window.addEventListener('keydown', handleKeyDown)
    }
  }
  isListening.value = !isListening.value
}

const restartOnceListener = () => {
  onceActivated.value = false
  onceListenerActive.value = true
  
  // Destroy old listener
  onceListener?.destroy()
  
  // Create new once listener
  onceListener = new KeySequenceListener({
    sequence: ['1', '2', '3'],
    onMatch: () => {
      onceActivated.value = true
      onceListenerActive.value = false
      setTimeout(() => {
        onceActivated.value = false
      }, 3000)
    },
    once: true,
    timeout: 3000,
  })
  onceListener.start()
}

onMounted(() => {
  // Konami Code listener
  konamiListener = new KeySequenceListener({
    sequence: KONAMI_CODE,
    onMatch: () => {
      activated.value = true
      setTimeout(() => {
        activated.value = false
      }, 3000)
    },
    onMismatch: () => {
      triggerErrorShake()
      progress.value = 0
    },
    onTimeout: () => {
      triggerTimeoutShake()
      progress.value = 0
    },
    timeout: 5000,
    resetOnMismatch: true,
  })
  konamiListener.start()

  // Custom sequence listener (HELLO)
  customListener = new KeySequenceListener({
    sequence: ['h', 'e', 'l', 'l', 'o'],
    onMatch: () => {
      customActivated.value = true
      setTimeout(() => {
        customActivated.value = false
      }, 3000)
    },
    timeout: 3000,
  })
  customListener.start()

  // Once mode listener (1-2-3)
  onceListener = new KeySequenceListener({
    sequence: ['1', '2', '3'],
    onMatch: () => {
      onceActivated.value = true
      onceListenerActive.value = false
      setTimeout(() => {
        onceActivated.value = false
      }, 3000)
    },
    once: true,
    timeout: 3000,
  })
  onceListener.start()

  // Gamepad listener
  gamepadListener = new KeySequenceListener({
    sequence: [
      GamepadButtons.Up,
      GamepadButtons.Up,
      GamepadButtons.Down,
      GamepadButtons.Down,
      GamepadButtons.Left,
      GamepadButtons.Right,
      GamepadButtons.Left,
      GamepadButtons.Right,
      GamepadButtons.B,
      GamepadButtons.A
    ],
    enableGamepad: true,
    onMatch: () => {
      gamepadActivated.value = true
      setTimeout(() => {
        gamepadActivated.value = false
      }, 3000)
    },
    onProgress: (current) => {
      gamepadProgress.value = current
    },
    onInput: (key) => {
      updateGamepadHistory(key)
    },
    onMismatch: () => {
      triggerErrorShake()
      gamepadProgress.value = 0
    },
    onTimeout: () => {
      triggerTimeoutShake()
      gamepadProgress.value = 0
    },
    timeout: 5000,
    resetOnMismatch: true,
  })
  gamepadListener.start()

  // Track progress and key history
  handleKeyDown = (event: KeyboardEvent) => {
    if (konamiListener) {
      progress.value = konamiListener.getProgress()
    }
    updateKeyHistory(event.key)
  }

  window.addEventListener('keydown', handleKeyDown!)

  // Gamepad connection handlers
  handleGamepadConnect = () => {
    gamepadConnected.value = true
  }
  handleGamepadDisconnect = () => {
    gamepadConnected.value = false
  }
  window.addEventListener('gamepadconnected', handleGamepadConnect)
  window.addEventListener('gamepaddisconnected', handleGamepadDisconnect)
  
  // Check initial state
  if (navigator.getGamepads && navigator.getGamepads()[0]) {
    gamepadConnected.value = true
  }

  onUnmounted(() => {
    konamiListener?.destroy()
    customListener?.destroy()
    onceListener?.destroy()
    gamepadListener?.destroy()
    if (handleKeyDown) {
      window.removeEventListener('keydown', handleKeyDown)
    }
    if (handleGamepadConnect) {
      window.removeEventListener('gamepadconnected', handleGamepadConnect)
    }
    if (handleGamepadDisconnect) {
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnect)
    }
  })
})
</script>

<style scoped>
.status-indicator {
  display: inline-block;
  padding: 0.4em 0.8em;
  border-radius: 4px;
  background: rgba(255, 50, 50, 0.2);
  color: #ff6b6b;
  font-size: 0.9em;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 50, 50, 0.3);
}

.status-indicator.connected {
  background: rgba(50, 255, 100, 0.2);
  color: #42b883;
  border-color: rgba(50, 255, 100, 0.3);
}

.demo {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

h2 {
  font-size: 1.8em;
  margin-bottom: 1rem;
  color: #646cff;
}

h3 {
  font-size: 1.3em;
  margin-bottom: 0.8rem;
}

.instruction {
  font-size: 1.1em;
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

kbd {
  display: inline-block;
  padding: 0.3em 0.6em;
  font-size: 0.9em;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin: 0 0.2em;
  font-family: monospace;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #646cff, #42b883);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 1.2em;
  font-weight: bold;
  color: #42b883;
  margin-bottom: 1rem;
}

.success-message {
  background: linear-gradient(135deg, #42b883, #35495e);
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  animation: bounce 0.5s ease;
}

.success-message h3 {
  font-size: 2em;
  margin: 0;
  color: white;
}

.success-message p {
  margin-top: 0.5rem;
  font-size: 1.2em;
  color: rgba(255, 255, 255, 0.9);
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes errorShake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-8px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(8px);
  }
}

@keyframes errorShadow {
  0% {
    box-shadow: inset 0 0 0 0 rgba(255, 0, 0, 0);
  }
  50% {
    box-shadow: inset 0 0 80px 20px rgba(255, 0, 0, 0.4),
                inset 0 0 120px 40px rgba(220, 20, 60, 0.3);
  }
  100% {
    box-shadow: inset 0 0 0 0 rgba(255, 0, 0, 0);
  }
}

@keyframes timeoutShake {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  25% {
    transform: translateY(-5px) scale(0.98);
  }
  75% {
    transform: translateY(5px) scale(0.98);
  }
}

@keyframes timeoutShadow {
  0% {
    box-shadow: inset 0 0 0 0 rgba(255, 193, 7, 0);
  }
  50% {
    box-shadow: inset 0 0 100px 30px rgba(255, 193, 7, 0.5),
                inset 0 0 150px 50px rgba(255, 152, 0, 0.4);
  }
  100% {
    box-shadow: inset 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

.demo.error-shake {
  animation: errorShake 0.5s ease, errorShadow 0.5s ease;
}

.demo.timeout-shake {
  animation: timeoutShake 0.6s ease, timeoutShadow 0.6s ease;
}

.info-message {
  background: rgba(100, 108, 255, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  color: #646cff;
  font-weight: bold;
}

.once-mode {
  background: rgba(255, 193, 7, 0.05);
  border-color: rgba(255, 193, 7, 0.2);
}

.once-mode button {
  margin-top: 1rem;
}

.once-mode button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.key-history {
  margin-top: 2rem;
  text-align: left;
}

.keys {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.key-item {
  display: inline-block;
  padding: 0.5em 1em;
  background: rgba(100, 108, 255, 0.2);
  border: 1px solid rgba(100, 108, 255, 0.4);
  border-radius: 6px;
  font-family: monospace;
  font-weight: bold;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.controls button {
  flex: 1;
  max-width: 200px;
}

.custom-sequence {
  background: rgba(66, 184, 131, 0.05);
  border-color: rgba(66, 184, 131, 0.2);
}

@media (prefers-color-scheme: light) {
  .card {
    background: rgba(0, 0, 0, 0.02);
    border-color: rgba(0, 0, 0, 0.1);
  }
  
  kbd {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.1);
  }
}
</style>
