import DatashareClient from '@/api/DatashareClient'

export const datashare = new DatashareClient()

export const actions = {
  async getConfig (state) {
    return datashare.getConfig()
  }
}

export default {
  namespaced: true,
  actions
}
