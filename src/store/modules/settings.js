function actionBuilder (api) {
  return {
    getSettings () {
      try {
        return api.getSettings()
      } catch (_) {}
    },
    onSubmit (state, settings) {
      return api.setSettings(settings)
    }
  }
}

export function settingsStoreBuilder (api) {
  return {
    namespaced: true,
    actions: actionBuilder(api)
  }
}
