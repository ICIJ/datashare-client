import { getCurrentInstance } from 'vue'
import { createPinia } from 'pinia'
import { usePipelinesStore } from '@/store/modules/pipelines'

export const withPinia = () => {
  return () => ({
    setup() {
      const { app } = getCurrentInstance()?.appContext
      const pinia = createPinia()
      app.use(pinia)
      // We unregister all pipelines to avoid conflicts
      const pipelinesStore = usePipelinesStore()
      pipelinesStore.unregister('username-is-you')
    },
    template: '<story />'
  })
}

export default { withPinia }
