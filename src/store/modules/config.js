import Api from '@/api'

export const datashare = new Api()

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
