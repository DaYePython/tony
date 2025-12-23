<template>
  <div class="max-w-4xl mx-auto p-4 font-sans">
    <TabsRoot v-model="activeTab" class="flex flex-col w-full">
      <TabsList class="flex shrink-0 border-b border-gray-200 dark:border-gray-700 mb-4" aria-label="Demo modes">
        <TabsTrigger 
          value="keyboard" 
          class="px-5 py-2.5 flex items-center justify-center text-sm font-medium leading-none select-none first:rounded-tl-md last:rounded-tr-md hover:text-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative outline-none cursor-pointer dark:text-gray-400 dark:hover:text-blue-400 dark:data-[state=active]:text-blue-400 transition-colors duration-200"
        >
          <span class="mr-2 text-lg">⌨️</span>
          Keyboard
        </TabsTrigger>
        <TabsTrigger 
          value="gamepad" 
          class="px-5 py-2.5 flex items-center justify-center text-sm font-medium leading-none select-none first:rounded-tl-md last:rounded-tr-md hover:text-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative outline-none cursor-pointer dark:text-gray-400 dark:hover:text-blue-400 dark:data-[state=active]:text-blue-400 transition-colors duration-200"
        >
          <span class="mr-2 text-lg">🎮</span>
          Gamepad
        </TabsTrigger>
      </TabsList>

      <!-- Keyboard Tab -->
      <TabsContent value="keyboard" class="outline-none focus:shadow-[0_0_0_2px] focus:shadow-blue-400 rounded-md">
        <div class="grid gap-6">
          <KonamiCard ref="konamiCard" />
          <CustomSequenceCard ref="customCard" />
          <OnceModeCard ref="onceCard" />
          
          <div class="p-6 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
            <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Global Controls</h3>
            <div class="flex gap-4">
              <button 
                @click="resetAll" 
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                Reset All Progress
              </button>
              <button 
                @click="toggleAll" 
                class="px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                :class="isListening ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500' : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'"
              >
                {{ isListening ? 'Stop All Listeners' : 'Start All Listeners' }}
              </button>
            </div>
          </div>
        </div>
      </TabsContent>

      <!-- Gamepad Tab -->
      <TabsContent value="gamepad" class="outline-none focus:shadow-[0_0_0_2px] focus:shadow-blue-400 rounded-md">
        <div class="grid gap-6">
          <GamepadCard ref="gamepadCard" />
          
          <div class="p-6 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
            <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Global Controls</h3>
            <div class="flex gap-4">
              <button 
                @click="resetAll" 
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                Reset All Progress
              </button>
              <button 
                @click="toggleAll" 
                class="px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                :class="isListening ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500' : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'"
              >
                {{ isListening ? 'Stop All Listeners' : 'Start All Listeners' }}
              </button>
            </div>
          </div>
        </div>
      </TabsContent>
    </TabsRoot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui'
import KonamiCard from './KonamiCard.vue'
import CustomSequenceCard from './CustomSequenceCard.vue'
import OnceModeCard from './OnceModeCard.vue'
import GamepadCard from './GamepadCard.vue'

const activeTab = ref('keyboard')
const isListening = ref(true)

const konamiCard = ref<InstanceType<typeof KonamiCard> | null>(null)
const customCard = ref<InstanceType<typeof CustomSequenceCard> | null>(null)
const onceCard = ref<InstanceType<typeof OnceModeCard> | null>(null)
const gamepadCard = ref<InstanceType<typeof GamepadCard> | null>(null)

const resetAll = () => {
  konamiCard.value?.reset()
  customCard.value?.reset()
  onceCard.value?.reset()
  gamepadCard.value?.reset()
}

const toggleAll = () => {
  isListening.value = !isListening.value
  if (isListening.value) {
    konamiCard.value?.start()
    customCard.value?.start()
    onceCard.value?.start()
    gamepadCard.value?.start()
  } else {
    konamiCard.value?.stop()
    customCard.value?.stop()
    onceCard.value?.stop()
    gamepadCard.value?.stop()
  }
}
</script>
