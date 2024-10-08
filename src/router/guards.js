import get from 'lodash/get'
import isFunction from 'lodash/isFunction'

export default ({ router, auth, store, config, i18n, setPageTitle }) => {
  async function checkUserAuthentication(to, from, next) {
    try {
      const username = await auth.getUsername()
      const skipsAuth = to.matched.some((r) => get(r, 'meta.skipsAuth', false))
      if (skipsAuth) {
        next()
        // The user is authenticated
      } else if (username) {
        const path = await store.dispatch('app/popRedirectAfterLogin')
        if (to.path !== path && path !== null) {
          next({ path })
        } else {
          next()
        }
        // The user isn't authenticated
      } else if (from.name !== 'login' && to.name !== 'login') {
        store.commit('app/setRedirectAfterLogin', to.path)
        next({ name: 'login' })
      } else {
        next()
      }
    } catch (error) {
      next({ name: 'error', state: { error } })
    }
  }

  function checkUserProjects(to, from, next) {
    const projects = config.get('projects', [])
    // No project given for this user
    if (!projects.length && ['error', 'login'].indexOf(to.name) === -1) {
      const title = i18n.global.t('error.noProjects')
      next({ name: 'error', state: { foo: title } })
    } else {
      next()
    }
  }

  async function setPageTitleFromMeta({ meta }, _from, next) {
    const params = { router, auth, store, config, i18n }
    let title
    if (meta.title) {
      title = isFunction(meta.title) ? await meta.title(params) : i18n.global.t(meta.title)
    }
    setPageTitle(title)
    next()
  }

  function checkMode({ meta }, _from, next) {
    const currentMode = config.get('mode')
    const allowedModes = get(meta, 'allowedModes', [])
    if (allowedModes.length === 0 || allowedModes.includes(currentMode)) {
      next()
    } else {
      const title = i18n.global.t('error.notFound')
      next({ name: 'error', state: { title } })
    }
  }

  router.beforeEach(checkMode)
  router.beforeEach(checkUserAuthentication)
  router.beforeEach(checkUserProjects)
  router.beforeEach(setPageTitleFromMeta)
}
