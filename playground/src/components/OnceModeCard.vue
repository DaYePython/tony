<template>
  <div class="p-6 bg-white rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Once Mode 🎯</h2>
    <p class="mb-4 text-gray-600 dark:text-gray-300">
      Press: <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">1</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">2</kbd> <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">3</kbd> (triggers only once)
    </p>
    
    <div v-if="activated" class="p-4 bg-green-100 border border-green-300 rounded-lg text-green-800 mb-4 animate-bounce dark:bg-green-900 dark:border-green-700 dark:text-green-100">
      🎯 Triggered! This listener has stopped.
    </div>

    <div v-if="!isListening && !activated" class="p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 mb-4 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-200">
      ⚠️ Listener stopped
    </div>

    <button 
      @click="handleRestart" 
      :disabled="isListening"
      class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Restart Once Listener
    </button>
  </div>
</template>

<script setup lang="ts">
import { useKeySequence } from '../composables/useKeySequence'

const { activated, isListening, start, stop, reset } = useKeySequence({
  sequence: ['1', '2', '3'],
  once: true,
  timeout: 3000,
  onMatch: () => {
    setTimeout(() => {
      activated.value = false
    }, 3000)
  }
})

const handleRestart = () => {
  reset()
  start()
}

defineExpose({
  reset,
  start,
  stop
})
</script>
