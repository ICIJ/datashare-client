import { get, isString, isFunction } from 'lodash'

import { useAppStore } from '@/store/modules'
import { useNProgress } from '@/composables/useNProgress'
import { usePolicies } from '@/composables/usePolicies.js'
import useMode from '@/composables/useMode.js'

export default (core) => {
  const { router, auth, config, i18n } = core
  const { isServer } = useMode(core)
  const { getRolesByProject } = usePolicies()

  /**
   * Verifies the user is authenticated via cookie. Routes with `meta.skipsAuth`
   * bypass this check. Unauthenticated users are redirected to the login page,
   * with their original destination stored for redirect after login.
   */
  async function checkUserAuthentication(to, from, next) {
    const appStore = useAppStore()
    try {
      const username = await auth.getUsername()
      const skipsAuth = to.matched.some(r => get(r, 'meta.skipsAuth', false))
      if (skipsAuth) {
        next()
      }
      else if (username) {
        const path = appStore.popRedirectAfterLogin()
        if (to.path !== path && path !== null) {
          next({ path })
        }
        else {
          next()
        }
      }
      else if (from.name !== 'login' && to.name !== 'login') {
        appStore.setRedirectAfterLogin(to.path)
        next({ name: 'login' })
      }
      else {
        next()
      }
    }
    catch (error) {
      next({ name: 'error', state: { error } })
    }
  }

  /**
   * Ensures the user has at least one project assigned. If no projects are
   * configured and the target route is not the error or login page, the user
   * is redirected to an error page.
   */
  function checkUserProjects(to, from, next) {
    const projects = config.get('projects', [])
    // No project given for this user
    if (!projects.length && ['error', 'login'].indexOf(to.name) === -1) {
      const title = i18n.global.t('error.noProjects')
      next({ name: 'error', state: { foo: title } })
    }
    else {
      next()
    }
  }

  /**
   * Resets the page context and sets the page title from the route's `meta.title`.
   * The title can be a translation key string or an async function receiving the
   * core instance.
   */
  async function preparePageContext({ meta }, _from, next) {
    core.clearPageContext()
    // Use title from the route meta as a function
    if (isFunction(meta?.title)) {
      core.pageTitle = await meta.title(core)
    }
    // Or use the title from the route meta as a translation key
    else if (isString(meta?.title)) {
      core.pageTitle = i18n.global.t(meta.title)
    }
    next()
  }

  /**
   * Enforces role-based access control on routes in SERVER mode. Routes that
   * require specific roles must declare both `meta.allowedRoles` (e.g. `['ADMIN']`)
   * and `meta.projectParam` (the route param name holding the project identifier,
   * e.g. `'name'`). The guard looks up the user's roles for that project and
   * allows access only if at least one role matches. Skipped entirely in
   * LOCAL/EMBEDDED modes where there is no role enforcement.
   */
  function checkUserRoles({ meta, params }, _from, next) {
    if (!isServer.value) {
      return next()
    }
    const allowedRoles = get(meta, 'allowedRoles', [])
    if (allowedRoles.length === 0) {
      return next()
    }
    const projectParam = meta.projectParam
    if (!projectParam || !params[projectParam]) {
      const title = i18n.global.t('error.notFound')
      return next({ name: 'error', state: { title } })
    }
    const currentRoles = getRolesByProject(params[projectParam])
    const hasOneRole = allowedRoles.some(role => currentRoles.includes(role))
    if (hasOneRole) {
      next()
    }
    else {
      const title = i18n.global.t('error.notFound')
      next({ name: 'error', state: { title } })
    }
  }

  /**
   * Restricts routes to specific application modes. If a route declares
   * `meta.allowedModes` (e.g. `['LOCAL', 'EMBEDDED']`), navigation is only
   * allowed when the current mode is in that list. Routes without
   * `allowedModes` are accessible in all modes.
   */
  function checkMode({ meta }, _from, next) {
    const currentMode = config.get('mode')
    const allowedModes = get(meta, 'allowedModes', [])
    if (allowedModes.length === 0 || allowedModes.includes(currentMode)) {
      next()
    }
    else {
      const title = i18n.global.t('error.notFound')
      next({ name: 'error', state: { title } })
    }
  }

  /**
   * Starts the NProgress loading bar at the beginning of each navigation.
   */
  function startProgress() {
    const { start } = useNProgress()
    start()
  }

  /**
   * Completes the NProgress loading bar after navigation settles.
   */
  function endProgress() {
    const { done } = useNProgress()
    setTimeout(done, 200)
  }

  router.beforeEach(checkMode)
  router.beforeEach(checkUserRoles)
  router.beforeEach(checkUserAuthentication)
  router.beforeEach(checkUserProjects)
  router.beforeEach(preparePageContext)
  router.beforeEach(startProgress)
  router.afterEach(endProgress)
}
