import { createApp } from 'vue'
import App from './App.vue'

// Throwaway variants are available only in development, on the existing home route.
if (import.meta.env.DEV && new URLSearchParams(location.search).has('variant')) {
  import('./features/journey/prototype/MemoryPrototype.vue').then(({ default: Prototype }) => {
    createApp(Prototype).mount('#app')
  })
} else {
  createApp(App).mount('#app')
}
