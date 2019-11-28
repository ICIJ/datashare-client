import DatashareClient from '@/api/DatashareClient'

export const datashare = new DatashareClient()

export const actions = {
  async getConfig () {
    return datashare.getConfig()
  },
  onSubmit (state, config) {
    return datashare.setConfig(config)
  }
}

export default {
  namespaced: true,
  actions
}
