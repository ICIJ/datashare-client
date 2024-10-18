import Murmur from '@icij/murmur-next'
import { getCurrentInstance } from 'vue'

export const withMurmur = (config = {},
                            useConfig = true,
                            useI18n = false,
                            useBootstrap = false,
                            registerComponents = true) => {
  return () => ({
    setup () {
        const { app } = getCurrentInstance()?.appContext
        Murmur.config.merge(config)
        app.use(Murmur, { useConfig, useI18n, useBootstrap, registerComponents })
    },
    template: '<story />'
  })
}

export default { withMurmur }
