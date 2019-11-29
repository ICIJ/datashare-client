import DatashareClient from '@/api/DatashareClient'

export const datashare = new DatashareClient()

export const actions = {
  getConfig () {
    try {
      return datashare.getConfig()
    } catch (_) {}
  },
  onSubmit (state, config) {
    try {
      return datashare.setConfig(config)
    } catch (_) {}
  }
}

export default {
  namespaced: true,
  actions
}
