<template>
  <div class="demo-wrapper">
    <TabsRoot v-model="activeTab" class="tabs-root">
      <TabsList class="tabs-list" aria-label="Demo modes">
        <TabsTrigger value="keyboard" class="tabs-trigger">
          <span class="tab-icon">⌨️</span>
          Keyboard
        </TabsTrigger>
        <TabsTrigger value="gamepad" class="tabs-trigger">
          <span class="tab-icon">🎮</span>
          Gamepad
        </TabsTrigger>
      </TabsList>

      <!-- Tab Content -->
      <div class="demo" :class="{ 'error-shake': errorShaking, 'timeout-shake': timeoutShaking }">
      <!-- Keyboard Tab -->
      <TabsContent value="keyboard" class="tab-content">
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
            <div v-if="customSequenceError" class="error-message">
              ⚠️ {{ customSequenceError }}
            </div>
            <div v-if="!recordedSequence.length">
              <p>Record your own sequence!</p>
              <button @click="toggleRecording" :class="{ recording: isRecording }">
                {{ isRecording ? '⏹️ Stop Recording' : '⏺️ Start Recording' }}
              </button>
              <div v-if="isRecording" class="recording-indicator">
                🔴 Recording... Press any keys
              </div>
            </div>
            <div v-else>
              <p>Your sequence: 
                <span v-for="(key, index) in recordedSequence" :key="index">
                  <kbd>{{ formatKey(key) }}</kbd>
                </span>
              </p>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: (customProgress / recordedSequence.length) * 100 + '%' }"></div>
              </div>
              <p class="progress-text">Progress: {{ customProgress }} / {{ recordedSequence.length }}</p>
              <div v-if="customActivated" class="success-message">
                ✅ Sequence matched!
              </div>
              <div class="button-group">
                <button @click="clearRecordedSequence">Clear Sequence</button>
                <button @click="toggleRecording" :class="{ recording: isRecording }">
                  {{ isRecording ? '⏹️ Stop Recording' : '⏺️ Re-record' }}
                </button>
              </div>
              <div v-if="isRecording" class="recording-indicator">
                🔴 Recording... Press any keys
              </div>
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

          <div class="card controls">
            <h3>Controls</h3>
            <button @click="resetProgress">Reset Progress</button>
            <button @click="toggleListener">{{ isListening ? 'Stop' : 'Start' }} Listener</button>
          </div>
        </TabsContent>

        <!-- Gamepad Tab -->
        <TabsContent value="gamepad" class="tab-content">
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
        </TabsContent>
      </div>
    </TabsRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { KeySequenceListener, KONAMI_CODE, GamepadButtons } from '@daye-cli/keyboard-sequence-listener'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui'

// Tab management
const activeTab = ref<'keyboard' | 'gamepad'>('keyboard')

const sequence = ref(KONAMI_CODE)
const progress = ref(0)
const activated = ref(false)
const customActivated = ref(false)
const customProgress = ref(0)
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
const isRecording = ref(false)
const recordedSequence = ref<string[]>([])
const recordingKeys = ref<string[]>([])
const customSequenceError = ref('')

let konamiListener: KeySequenceListener | null = null
let customListener: KeySequenceListener | null = null
let onceListener: KeySequenceListener | null = null
let gamepadListener: KeySequenceListener | null = null
let handleKeyDown: ((event: KeyboardEvent) => void) | null = null
let handleRecording: ((event: KeyboardEvent) => void) | null = null
let handleGamepadConnect: ((event: GamepadEvent) => void) | null = null
let handleGamepadDisconnect: ((event: GamepadEvent) => void) | null = null

const switchTab = (tab: 'keyboard' | 'gamepad', force: boolean = true) => {
  if (force || activeTab.value !== tab) {
    activeTab.value = tab
  }
}

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

const toggleRecording = () => {
  if (isRecording.value) {
    // Stop recording
    isRecording.value = false
    if (recordingKeys.value.length > 0) {
      // Validate: Check if sequence starts with ArrowUp to prevent Konami Code interference
      const firstKey = recordingKeys.value[0]?.toLowerCase()
      if (firstKey === 'arrowup') {
        customSequenceError.value = 'Custom sequence cannot start with ArrowUp to prevent interference with Konami Code!'
        recordingKeys.value = []
        // Clear error after 5 seconds
        setTimeout(() => {
          customSequenceError.value = ''
        }, 5000)
      } else {
        customSequenceError.value = ''
        recordedSequence.value = [...recordingKeys.value]
        // Create a new custom listener with the recorded sequence
        createCustomListener()
      }
    }
    recordingKeys.value = []
    if (handleRecording) {
      window.removeEventListener('keydown', handleRecording)
    }
  } else {
    // Start recording
    isRecording.value = true
    recordingKeys.value = []
    customActivated.value = false
    customProgress.value = 0
    customSequenceError.value = ''
    
    // Stop existing custom listener during recording
    customListener?.stop()
    
    handleRecording = (event: KeyboardEvent) => {
      event.preventDefault()
      const key = event.key.toLowerCase()
      recordingKeys.value.push(key)
    }
    window.addEventListener('keydown', handleRecording)
  }
}

const clearRecordedSequence = () => {
  recordedSequence.value = []
  recordingKeys.value = []
  customActivated.value = false
  customProgress.value = 0
  customSequenceError.value = ''
  customListener?.destroy()
  customListener = null
}

const createCustomListener = () => {
  // Destroy old custom listener if exists
  customListener?.destroy()
  
  if (recordedSequence.value.length === 0) {
    return
  }
  
  // Create new custom listener with recorded sequence
  customListener = new KeySequenceListener({
    sequence: recordedSequence.value,
    onMatch: () => {
      customActivated.value = true
      setTimeout(() => {
        customActivated.value = false
      }, 3000)
    },
    onProgress: (current) => {
      customProgress.value = current
    },
    onMismatch: () => {
      customProgress.value = 0
    },
    onTimeout: () => {
      customProgress.value = 0
    },
    timeout: 5000,
    resetOnMismatch: true,
  })
  customListener.start()
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

  // Custom sequence listener - will be created when user records a sequence
  // No initial listener

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
    onInput: (key, source) => {
      if (source === 'gamepad') {
        updateGamepadHistory(key)
        // Auto-switch to gamepad tab on gamepad input
        switchTab('gamepad', false)
      }
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
    // Auto-switch to keyboard tab on keyboard input
    switchTab('keyboard', false)
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
    if (handleRecording) {
      window.removeEventListener('keydown', handleRecording)
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
.demo-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Reka UI Tabs Styling */
.tabs-root {
  width: 100%;
}

.tabs-list {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.tabs-trigger {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.tabs-trigger::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(100, 108, 255, 0.1), rgba(66, 184, 131, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tabs-trigger:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-1px);
}

.tabs-trigger:hover::before {
  opacity: 1;
}

.tabs-trigger[data-state="active"] {
  background: linear-gradient(135deg, rgba(100, 108, 255, 0.15), rgba(66, 184, 131, 0.12));
  color: #646cff;
  box-shadow: 0 2px 8px rgba(100, 108, 255, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.tabs-trigger[data-state="active"]::before {
  opacity: 1;
}

.tab-icon {
  font-size: 1.25em;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.tab-content {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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
  gap: 1.5rem;
  width: 100%;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1),
              0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15),
              0 2px 6px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

h2 {
  font-size: 1.8em;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #646cff, #42b883);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

h3 {
  font-size: 1.3em;
  margin-bottom: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.instruction {
  font-size: 1.05em;
  margin-bottom: 1.5rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
}

kbd {
  display: inline-block;
  padding: 0.4em 0.75em;
  font-size: 0.9em;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  margin: 0 0.25em;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-weight: 600;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.95);
}

.progress-bar {
  width: 100%;
  height: 32px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #646cff, #42b883);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(100, 108, 255, 0.5);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-text {
  font-size: 1.1em;
  font-weight: 700;
  color: #42b883;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.success-message {
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.2), rgba(100, 108, 255, 0.15));
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  animation: successBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 1px solid rgba(66, 184, 131, 0.3);
  box-shadow: 0 4px 16px rgba(66, 184, 131, 0.2);
}

.success-message h3 {
  font-size: 1.8em;
  margin: 0;
  color: #42b883;
  font-weight: 700;
}

.success-message p {
  margin-top: 0.5rem;
  font-size: 1.1em;
  color: rgba(255, 255, 255, 0.9);
}

@keyframes successBounce {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.05);
  }
  50% {
    transform: scale(0.95);
  }
  75% {
    transform: scale(1.02);
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

.status-indicator {
  display: inline-block;
  padding: 0.5em 1em;
  border-radius: 8px;
  background: rgba(255, 50, 50, 0.15);
  color: #ff6b6b;
  font-size: 0.95em;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 50, 50, 0.3);
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(255, 50, 50, 0.2);
}

.status-indicator.connected {
  background: rgba(50, 255, 100, 0.15);
  color: #42b883;
  border-color: rgba(50, 255, 100, 0.3);
  box-shadow: 0 2px 4px rgba(50, 255, 100, 0.2);
}

.info-message {
  background: rgba(100, 108, 255, 0.15);
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem 0;
  color: #646cff;
  font-weight: 600;
  border: 1px solid rgba(100, 108, 255, 0.3);
}

.error-message {
  background: rgba(255, 50, 50, 0.15);
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem 0;
  color: #ff6b6b;
  font-weight: 600;
  border: 1px solid rgba(255, 50, 50, 0.3);
  animation: fadeInShake 0.4s ease;
}

@keyframes fadeInShake {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  50% {
    transform: translateX(5px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.once-mode {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.08), rgba(255, 152, 0, 0.05));
  border-color: rgba(255, 193, 7, 0.25);
}

.once-mode button {
  margin-top: 1rem;
}

.once-mode button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.key-history {
  margin-top: 2rem;
  text-align: left;
}

.keys {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin-top: 1rem;
}

.key-item {
  display: inline-block;
  padding: 0.625em 1.125em;
  background: linear-gradient(135deg, rgba(100, 108, 255, 0.2), rgba(66, 184, 131, 0.15));
  border: 1px solid rgba(100, 108, 255, 0.35);
  border-radius: 8px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  animation: keyPop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes keyPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.controls button {
  flex: 1;
  min-width: 180px;
}

.custom-sequence {
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.08), rgba(100, 108, 255, 0.05));
  border-color: rgba(66, 184, 131, 0.25);
}

.recording-indicator {
  margin-top: 1rem;
  padding: 1.125rem;
  background: linear-gradient(135deg, rgba(255, 0, 0, 0.12), rgba(255, 100, 100, 0.08));
  border: 1px solid rgba(255, 0, 0, 0.35);
  border-radius: 10px;
  color: #ff6b6b;
  font-weight: 700;
  animation: pulse 1.5s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(255, 0, 0, 0.2);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.75;
    transform: scale(0.98);
  }
}

button {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0.75em 1.5em;
  font-size: 1em;
  font-weight: 600;
  font-family: inherit;
  background: linear-gradient(135deg, rgba(100, 108, 255, 0.15), rgba(66, 184, 131, 0.12));
  color: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

button:hover {
  border-color: rgba(100, 108, 255, 0.4);
  background: linear-gradient(135deg, rgba(100, 108, 255, 0.25), rgba(66, 184, 131, 0.2));
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

button.recording {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.25), rgba(238, 90, 111, 0.2));
  animation: recordingPulse 1.5s ease-in-out infinite;
  border-color: rgba(255, 107, 107, 0.4);
}

@keyframes recordingPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7),
                0 2px 4px rgba(0, 0, 0, 0.15);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 0, 0, 0),
                0 4px 8px rgba(255, 0, 0, 0.3);
  }
}

.button-group {
  display: flex;
  gap: 0.875rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.button-group button {
  flex: 1;
  min-width: 160px;
}

@media (prefers-color-scheme: light) {
  .tabs-list {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.08);
  }

  .tabs-trigger {
    color: rgba(0, 0, 0, 0.6);
  }

  .tabs-trigger:hover {
    color: rgba(0, 0, 0, 0.9);
    background: rgba(0, 0, 0, 0.05);
  }

  .tabs-trigger[data-state="active"] {
    background: linear-gradient(135deg, rgba(100, 108, 255, 0.12), rgba(66, 184, 131, 0.1));
    color: #646cff;
  }

  .card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95));
    border-color: rgba(0, 0, 0, 0.1);
  }

  kbd {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.05));
    border-color: rgba(0, 0, 0, 0.15);
    color: rgba(0, 0, 0, 0.9);
  }

  button {
    background: linear-gradient(135deg, rgba(100, 108, 255, 0.12), rgba(66, 184, 131, 0.1));
    color: rgba(0, 0, 0, 0.9);
    border-color: rgba(0, 0, 0, 0.12);
  }

  button:hover {
    background: linear-gradient(135deg, rgba(100, 108, 255, 0.2), rgba(66, 184, 131, 0.15));
    border-color: rgba(100, 108, 255, 0.3);
  }
}

@media (max-width: 768px) {
  .tabs-trigger {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
  }

  .tab-icon {
    font-size: 1.1em;
  }

  .card {
    padding: 1.5rem;
  }

  h2 {
    font-size: 1.5em;
  }

  .controls {
    flex-direction: column;
  }

  .controls button {
    width: 100%;
    min-width: 100%;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group button {
    width: 100%;
    min-width: 100%;
  }
}
</style>
