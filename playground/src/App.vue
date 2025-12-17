<template>
  <div class="app">
    <h1>🎮 Keyboard Sequence Listener Demo</h1>
    <KeySequenceDemo />
  </div>
</template>

<script setup lang="ts">
import KeySequenceDemo from './components/KeySequenceDemo.vue'
</script>

<style scoped>
.app {
  width: 100%;
}

h1 {
  font-size: 3em;
  line-height: 1.1;
  margin-bottom: 2rem;
}
</style>
