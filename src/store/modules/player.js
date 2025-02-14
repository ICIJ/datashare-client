import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePlayerStore = defineStore(
  'player',
  () => {
    const autoplay = ref(false)
    const loop = ref(true)

    return { autoplay, loop }
  },
  { persist: true }
)
