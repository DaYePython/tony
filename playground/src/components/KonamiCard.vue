<template>
  <div class="p-6 bg-white rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 hover:shadow-lg" :class="{ 'animate-shake': errorShaking, 'animate-pulse': timeoutShaking }">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Try the Konami Code!</h2>
    <p class="mb-4 text-gray-600 dark:text-gray-300">
      Press: <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">↑</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">↑</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">↓</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">↓</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">←</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">→</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">←</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">→</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">B</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">A</kbd>
    </p>
      
    <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2 dark:bg-gray-700">
      <div class="h-full bg-green-500 transition-all duration-300 ease-out" :style="{ width: progressPercentage + '%' }"></div>
    </div>
    <p class="text-sm text-gray-500 mb-4 dark:text-gray-400">Progress: {{ progress }} / {{ sequence.length }}</p>

    <div v-if="activated" class="p-4 bg-green-100 border border-green-300 rounded-lg text-green-800 mb-4 animate-bounce dark:bg-green-900 dark:border-green-700 dark:text-green-100">
      <h3 class="font-bold text-lg">🎉 Konami Code Activated!</h3>
      <p>You unlocked the secret!</p>
    </div>

    <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 class="font-semibold mb-2 text-gray-700 dark:text-gray-200">Recent Keys:</h3>
      <div class="flex flex-wrap gap-2 min-h-[2rem]">
        <span v-for="(key, index) in keyHistory" :key="index" class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 animate-fade-in">
          {{ formatKey(key) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { KONAMI_CODE } from '@daye-cli/keyboard-sequence-listener'
import { useKeySequence } from '../composables/useKeySequence'
import { formatKey } from '../utils/formatKey'
import { useEventListener } from '@vueuse/core'

const sequence = KONAMI_CODE
const keyHistory = ref<string[]>([])
const errorShaking = ref(false)
const timeoutShaking = ref(false)

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

const { progress, activated, reset, start, stop } = useKeySequence({
  sequence,
  onMatch: () => {
    // Success handled by activated ref
  },
  onMismatch: () => {
    triggerErrorShake()
  },
  onTimeout: () => {
    triggerTimeoutShake()
  },
  resetOnMismatch: true,
  timeout: 5000
})

const progressPercentage = computed(() => {
  return (progress.value / sequence.length) * 100
})

useEventListener(window, 'keydown', (event: KeyboardEvent) => {
  updateKeyHistory(event.key)
})

defineExpose({
  reset,
  start,
  stop
})
</script>

<style scoped>
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
