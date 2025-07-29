import { getCurrentInstance } from 'vue'
import { createPinia } from 'pinia'
import { usePipelinesStore } from '@/store/modules/pipelines'

export const withPinia = () => {
  return () => ({
    setup() {
      const instance = getCurrentInstance()
      if (!instance || !instance.appContext || !instance.appContext.app) {
        throw new Error('Vue instance or appContext is not available.')
      }
      const { app } = instance.appContext
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
