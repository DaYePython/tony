import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export function useSequenceRecorder() {
  const isRecording = ref(false)
  const recordedSequence = ref<string[]>([])
  const recordingKeys = ref<string[]>([])
  const error = ref('')

  const startRecording = () => {
    isRecording.value = true
    recordingKeys.value = []
    error.value = ''
  }

  const stopRecording = () => {
    isRecording.value = false
    if (recordingKeys.value.length > 0) {
      // Validate: Check if sequence starts with ArrowUp to prevent Konami Code interference
      const firstKey = recordingKeys.value[0]?.toLowerCase()
      if (firstKey === 'arrowup') {
        error.value = 'Custom sequence cannot start with ArrowUp to prevent interference with Konami Code!'
        recordingKeys.value = []
        recordedSequence.value = []
      } else {
        recordedSequence.value = [...recordingKeys.value]
      }
    }
  }

  const toggleRecording = () => {
    if (isRecording.value) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const clearRecordedSequence = () => {
    recordedSequence.value = []
    recordingKeys.value = []
    error.value = ''
  }

  useEventListener(window, 'keydown', (event: KeyboardEvent) => {
    if (!isRecording.value) return
    
    event.preventDefault()
    recordingKeys.value.push(event.code)
  })

  return {
    isRecording,
    recordedSequence,
    recordingKeys,
    error,
    toggleRecording,
    clearRecordedSequence
  }
}
