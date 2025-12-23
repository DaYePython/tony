<template>
  <div class="p-6 bg-white rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Gamepad Mode 🎮</h2>
    
    <div 
      class="mb-4 p-2 rounded text-sm font-medium transition-colors duration-300"
      :class="gamepadConnected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'"
    >
      Status: {{ gamepadConnected ? 'Connected' : 'Disconnected (Press any button)' }}
    </div>

    <p class="mb-4 text-gray-600 dark:text-gray-300">
      Press: <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">↑</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">↑</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">↓</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">↓</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">←</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">→</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">←</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">→</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">B</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">A</kbd>
    </p>
    
    <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2 dark:bg-gray-700">
      <div class="h-full bg-purple-500 transition-all duration-300 ease-out" :style="{ width: progressPercentage + '%' }"></div>
    </div>
    
    <div v-if="activated" class="p-4 bg-green-100 border border-green-300 rounded-lg text-green-800 mb-4 animate-bounce dark:bg-green-900 dark:border-green-700 dark:text-green-100">
      🎮 Gamepad Konami Code Activated!
    </div>

    <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 class="font-semibold mb-2 text-gray-700 dark:text-gray-200">Recent Gamepad Inputs:</h3>
      <div class="flex flex-wrap gap-2 min-h-[2rem]">
        <span v-for="(key, index) in gamepadHistory" :key="index" class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 animate-fade-in">
          {{ key }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { KONAMI_CODE } from '@daye-cli/keyboard-sequence-listener'
import { useKeySequence } from '../composables/useKeySequence'
import { useEventListener } from '@vueuse/core'

const gamepadConnected = ref(false)
const gamepadHistory = ref<string[]>([])

const updateGamepadHistory = (key: string) => {
  gamepadHistory.value.unshift(key)
  if (gamepadHistory.value.length > 10) {
    gamepadHistory.value.pop()
  }
}

const { progress, activated, reset, start, stop } = useKeySequence({
  sequence: KONAMI_CODE,
  enableGamepad: true,
  onInput: (key, source) => {
    if (source === 'gamepad') {
      updateGamepadHistory(key)
      gamepadConnected.value = true
    }
  },
  onMatch: () => {
    // Success handled by activated ref
  }
})

const progressPercentage = computed(() => {
  return (progress.value / KONAMI_CODE.length) * 100
})

useEventListener(window, 'gamepadconnected', () => {
  gamepadConnected.value = true
})

useEventListener(window, 'gamepaddisconnected', () => {
  gamepadConnected.value = false
})

defineExpose({
  reset,
  start,
  stop
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
