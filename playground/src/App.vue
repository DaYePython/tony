<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <h1>
          <span class="header-icon">🎮</span>
          Keyboard Sequence Listener
        </h1>
        <p class="header-subtitle">Interactive demo for keyboard and gamepad sequence detection</p>
      </div>
    </header>
    <main class="app-main">
      <KeySequenceDemo />
    </main>
  </div>
</template>

<script setup lang="ts">
import KeySequenceDemo from './components/KeySequenceDemo.vue'
</script>

<style scoped>
.app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 3rem 2rem 2rem;
  text-align: center;
  background: linear-gradient(180deg, rgba(100, 108, 255, 0.08), transparent);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2.75em;
  line-height: 1.2;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, #646cff, #42b883);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.header-icon {
  font-size: 1.2em;
  filter: drop-shadow(0 2px 8px rgba(100, 108, 255, 0.3));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.header-subtitle {
  font-size: 1.1em;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  margin: 0;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .app-header {
    padding: 2rem 1rem 1.5rem;
  }

  h1 {
    font-size: 2em;
    flex-direction: column;
    gap: 0.25rem;
  }

  .header-subtitle {
    font-size: 0.95em;
  }

  .app-main {
    padding: 1.5rem 1rem;
  }
}
</style>
