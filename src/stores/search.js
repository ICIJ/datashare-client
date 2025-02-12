import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = (id = 'search') => {
  const store = defineStore(id, () => {
    const count = ref(0)

    function increment() {
      count.value++
    }

    return { count, increment }
  })

  return store()
}