import get from 'lodash/get'
import isFunction from 'lodash/isFunction'

export default ({ router, auth, store, config, i18n, setPageTitle }) => {
  async function checkUserAuthentication(to, _from, next) {
    try {
      // This route skip auth
      if (to.matched.some((r) => get(r, 'meta.skipsAuth', false))) {
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

  function checkUserProjects(to, from, next) {
    const projects = config.get('projects', [])
    // No project given for this user
    if (!projects.length && ['error', 'login'].indexOf(to.name) === -1) {
      const title = i18n.t('error.noProjects')
      next({ name: 'error', params: { title } })
    } else {
      next()
    }
  }

  function reduceAppSideBar(_to, _from, next) {
    store.dispatch('app/toggleSidebar', true)
    next()
  }

  async function setPageTitleFromMeta({ meta }, _from, next) {
    const params = { router, auth, store, config, i18n }
    const title = isFunction(meta.title) ? await meta.title(params) : meta.title
    setPageTitle(title)
    next()
  }

  function checkMode({ meta }, _from, next) {
    const currentMode = config.get('mode')
    const allowedModes = get(meta, 'allowedModes', [])
    if (allowedModes.length === 0 || allowedModes.includes(currentMode)) {
      next()
    } else {
      const title = i18n.t('error.notFound')
      next({ name: 'error', params: { title } })
    }
  }

  router.beforeEach(checkMode)
  router.beforeEach(checkUserAuthentication)
  router.beforeEach(checkUserProjects)
  router.beforeEach(reduceAppSideBar)
  router.beforeEach(setPageTitleFromMeta)
}
