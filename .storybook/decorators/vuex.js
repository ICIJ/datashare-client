import { createStore } from 'vuex'
import { getCurrentInstance } from 'vue'

export const withVuex = (config = {}) => {
  return () => ({
    setup () {
        const { app } = getCurrentInstance()?.appContext
        app.use(createStore(config))
    },
    template: '<story />'
  })
}

export default { withVuex }
