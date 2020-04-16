import Api from '@/api'

export const api = new Api()

export const actions = {
  getSettings () {
    try {
      return api.getSettings()
    } catch (_) {}
  },
  onSubmit (state, settings) {
    return api.setSettings(settings)
  }
}

export default {
  namespaced: true,
  actions
}
