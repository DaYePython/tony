import { ref, onMounted, onUnmounted } from 'vue'
import { KeySequenceListener, type KeySequenceListenerOptions } from '@daye-cli/keyboard-sequence-listener'

export function useKeySequence(options: KeySequenceListenerOptions) {
  const listener = ref<KeySequenceListener | null>(null)
  const progress = ref(0)
  const activated = ref(false)
  const isListening = ref(false)

  const initListener = () => {
    if (listener.value) {
      listener.value.destroy()
    }

    listener.value = new KeySequenceListener({
      ...options,
      onProgress: (current, total) => {
        progress.value = current
        options.onProgress?.(current, total)
      },
      onMatch: () => {
        activated.value = true
        if (options.once) {
          isListening.value = false
        }
        options.onMatch?.()
      },
      onMismatch: () => {
        options.onMismatch?.()
      },
      onTimeout: () => {
        options.onTimeout?.()
      }
    })
  }

  const start = () => {
    listener.value?.start()
    isListening.value = true
  }

  const stop = () => {
    listener.value?.stop()
    isListening.value = false
  }

  const reset = () => {
    listener.value?.reset()
    progress.value = 0
    activated.value = false
  }

  onMounted(() => {
    initListener()
    start()
  })

  onUnmounted(() => {
    stop()
    listener.value?.destroy()
  })

  return {
    listener,
    progress,
    activated,
    isListening,
    start,
    stop,
    reset
  }
}
