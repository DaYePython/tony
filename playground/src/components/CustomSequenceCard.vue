<template>
  <div class="p-6 bg-white rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Custom Sequence</h2>
    
    <div v-if="error" class="p-3 mb-4 bg-red-100 border border-red-300 rounded text-red-800 text-sm flex items-center dark:bg-red-900 dark:border-red-700 dark:text-red-100">
      <span class="mr-2">⚠️</span> {{ error }}
    </div>

    <div v-if="!recordedSequence.length">
      <p class="mb-4 text-gray-600 dark:text-gray-300">Record your own sequence!</p>
      <button 
        @click="toggleRecording" 
        class="px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
        :class="isRecording ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500' : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'"
      >
        {{ isRecording ? '⏹️ Stop Recording' : '⏺️ Start Recording' }}
      </button>
      
      <div v-if="isRecording" class="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 animate-pulse flex items-center dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
        <span class="w-3 h-3 bg-red-500 rounded-full mr-2 animate-ping"></span>
        Recording... Press any keys
      </div>
    </div>

    <div v-else>
      <p class="mb-2 text-gray-700 dark:text-gray-200">
        Your sequence: 
        <span v-for="(key, index) in recordedSequence" :key="index">
          <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono mx-1 dark:bg-gray-700 dark:border-gray-600">{{ formatKey(key) }}</kbd>
        </span>
      </p>

      <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2 dark:bg-gray-700">
        <div class="h-full bg-blue-500 transition-all duration-300 ease-out" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <p class="text-sm text-gray-500 mb-4 dark:text-gray-400">Progress: {{ progress }} / {{ recordedSequence.length }}</p>

      <div v-if="activated" class="p-4 bg-green-100 border border-green-300 rounded-lg text-green-800 mb-4 animate-bounce dark:bg-green-900 dark:border-green-700 dark:text-green-100">
        ✅ Sequence matched!
      </div>

      <div class="flex gap-2 mt-4">
        <button 
          @click="handleClear" 
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          Clear Sequence
        </button>
        <button 
          @click="toggleRecording" 
          class="px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
          :class="isRecording ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500' : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'"
        >
          {{ isRecording ? '⏹️ Stop Recording' : '⏺️ Re-record' }}
        </button>
      </div>

      <div v-if="isRecording" class="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 animate-pulse flex items-center dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
        <span class="w-3 h-3 bg-red-500 rounded-full mr-2 animate-ping"></span>
        Recording... Press any keys
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useSequenceRecorder } from '../composables/useSequenceRecorder'
import { useKeySequence } from '../composables/useKeySequence'
import { formatKey } from '../utils/formatKey'

const { 
  isRecording, 
  recordedSequence, 
  error, 
  toggleRecording, 
  clearRecordedSequence 
} = useSequenceRecorder()

const { progress, activated, listener, reset, start, stop } = useKeySequence({
  sequence: [],
  onMatch: () => {},
  resetOnMismatch: true
})

const progressPercentage = computed(() => {
  if (!recordedSequence.value.length) return 0
  return (progress.value / recordedSequence.value.length) * 100
})

watch(recordedSequence, (newSequence) => {
  if (newSequence.length > 0) {
    listener.value?.updateSequence(newSequence)
    reset()
  }
})

const handleClear = () => {
  clearRecordedSequence()
  reset()
}

defineExpose({
  reset,
  start,
  stop
})
</script>
