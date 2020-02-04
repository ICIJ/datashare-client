import Api from '@/api'

export const api = new Api()

export const actions = {
  getConfig () {
    try {
      return api.getConfig()
    } catch (_) {}
  },
  onSubmit (state, config) {
    return api.setConfig(config)
  }
}

export default {
  namespaced: true,
  actions
}
