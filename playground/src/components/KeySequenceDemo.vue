<template>
  <div class="demo-wrapper">
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'keyboard' }" 
        @click="switchTab('keyboard')"
      >
        ⌨️ Keyboard
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'gamepad' }" 
        @click="switchTab('gamepad')"
      >
        🎮 Gamepad
      </button>
    </div>

    <!-- Tab Content -->
    <div class="demo" :class="{ 'error-shake': errorShaking, 'timeout-shake': timeoutShaking }">
      <!-- Keyboard Tab -->
      <transition name="tab-fade">
        <div v-if="activeTab === 'keyboard'" class="tab-content" key="keyboard">
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
        </div>
      </transition>

      <!-- Gamepad Tab -->
      <transition name="tab-fade">
        <div v-if="activeTab === 'gamepad'" class="tab-content" key="gamepad">
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
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { KeySequenceListener, KONAMI_CODE, GamepadButtons } from '@daye-cli/keyboard-sequence-listener'

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

const switchTab = (tab: 'keyboard' | 'gamepad') => {
  activeTab.value = tab
}

// Auto-switch to the specified tab only if not already on it
const switchToTab = (tab: 'keyboard' | 'gamepad') => {
  if (activeTab.value !== tab) {
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
        // Auto-switch to gamepad tab on gamepad input (only if not already on gamepad tab)
        switchToTab('gamepad')
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
    // Auto-switch to keyboard tab on keyboard input (only if not already on keyboard tab)
    switchToTab('keyboard')
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
  position: relative;
}

.tab-navigation {
  position: absolute;
  top: -60px;
  right: 0;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.tab-button {
  padding: 0.8em 1.5em;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px 8px 0 0;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1em;
  font-weight: 600;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.tab-button.active {
  background: rgba(100, 108, 255, 0.2);
  color: #646cff;
  border-color: rgba(100, 108, 255, 0.4);
  border-bottom: 2px solid rgba(100, 108, 255, 0.6);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

/* Tab transition animations */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.98);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.98);
}

.tab-fade-enter-to,
.tab-fade-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
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

.error-message {
  background: rgba(255, 50, 50, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  color: #ff6b6b;
  font-weight: bold;
  border: 1px solid rgba(255, 50, 50, 0.3);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.recording-indicator {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  color: #ff6b6b;
  font-weight: bold;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

button.recording {
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  animation: recordingPulse 1.5s ease-in-out infinite;
}

@keyframes recordingPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
  }
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.button-group button {
  flex: 1;
  min-width: 150px;
}

@media (prefers-color-scheme: light) {
  .tab-button {
    background: rgba(0, 0, 0, 0.02);
    border-color: rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 0.6);
  }
  
  .tab-button:hover {
    background: rgba(0, 0, 0, 0.05);
    color: rgba(0, 0, 0, 0.9);
    border-color: rgba(0, 0, 0, 0.2);
  }
  
  .tab-button.active {
    background: rgba(100, 108, 255, 0.1);
    color: #646cff;
    border-color: rgba(100, 108, 255, 0.3);
  }
  
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
