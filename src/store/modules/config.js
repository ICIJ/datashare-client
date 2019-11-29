import DatashareClient from '@/api/DatashareClient'

export const datashare = new DatashareClient()

export const actions = {
  getConfig () {
    try {
      return datashare.getConfig()
    } catch (_) {}
  },
  onSubmit (state, config) {
    return datashare.setConfig(config)
  }
}

export default {
  namespaced: true,
  actions
}
