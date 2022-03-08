import get from 'lodash/get'
import isFunction from 'lodash/isFunction'

export default ({ router, auth, store, config, i18n, setPageTitle }) => {
  function setProjectFromParams (to, from, next) {
    // Read the current index from the params
    if (to.params.index && store.state.search.index !== to.params.index) {
      store.commit('search/index', to.params.index)
    }
    if (to.params.indices && store.state.search.indices !== to.params.indices) {
      store.commit('search/indices', to.params.indices)
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
        const path = await store.dispatch('app/popRedirectAfterLogin')
        if (to.path !== path && path !== null) {
          next({ path })
        } else {
          next()
        }
      // The user isn't authenticated
      } else {
        store.commit('app/setRedirectAfterLogin', to.path)
        next({ name: 'login' })
      }
    } catch (error) {
      next({ name: 'error', params: { error } })
    }
  }

  function checkUserProjects (to, from, next) {
    const projects = config.get('groups_by_applications.datashare', [])
    // No project given for this user
    if (!projects.length && ['error', 'login'].indexOf(to.name) === -1) {
      const description = i18n.t('error.noProjects')
      next({ name: 'error', params: { description } })
    } else {
      next()
    }
  }

  function reduceAppSideBar (to, from, next) {
    store.dispatch('app/toggleSidebar', true)
    next()
  }

  async function setPageTitleFromMeta ({ meta }, from, next) {
    const params = { router, auth, store, config, i18n }
    const title = isFunction(meta.title) ? await meta.title(params) : meta.title
    setPageTitle(title)
    next()
  }

  router.beforeEach(setProjectFromParams)
  router.beforeEach(checkUserAuthentication)
  router.beforeEach(checkUserProjects)
  router.beforeEach(reduceAppSideBar)
  router.beforeEach(setPageTitleFromMeta)
}
