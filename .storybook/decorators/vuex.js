import { createStore } from 'vuex'
import { getCurrentInstance } from 'vue'
import {identity} from "lodash";

export const withVuex = (config = {}) => {
  return () => ({
    setup () {
        const { app } = getCurrentInstance()?.appContext
        app.use(createStore(config))
    },
    template: '<story />'
  })
}


export const storeDecoratorPipelineChainByCategory = withVuex({
  modules: {
    pipelines: {
      namespaced: true,
      getters: {
        applyPipelineChainByCategory() {
          return () => {
            return identity
          }
        }
      }
    }
  }
})
export default { withVuex, storeDecoratorPipelineChainByCategory }
