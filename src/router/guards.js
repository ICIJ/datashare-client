import get from 'lodash/get'

export default ({ router, auth, store, config, i18n }) => {
  function setProjectFromParams (to, from, next) {
    // Read the current index from the params
    if (to.params.index && store.state.search.index !== to.params.index) {
      store.commit('search/index', to.params.index)
    }
    next()
  }

  async function checkUserAuthentication (to, from, next) {
    try {
      // This route skip auth
      if (to.matched.some(r => get(r, 'meta.skipsAuth', false))) {
        next()
      // The user is authenticated
      } else if (await auth.getUsername()) {
        next()
      // The user isn't authenticated
      } else {
        next({ name: 'login' })
      }
    } catch (error) {
      next({ name: 'error', params: { error } })
    }
  }

  function checkUserProjects (to, from, next) {
    // No project given for this user
    if (!config.get('datashare_projects', []).length && ['error', 'login'].indexOf(to.name) === -1) {
      const description = i18n.t('error.noProjects')
      next({ name: 'error', params: { description } })
    } else {
      next()
    }
  }

  router.beforeEach(setProjectFromParams)
  router.beforeEach(checkUserAuthentication)
  router.beforeEach(checkUserProjects)
}
