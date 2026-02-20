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
   * Redirects to the error page with a "not found" title.
   * Shared by guards that deny access (checkMode, checkUserRoles).
   * @param {import('vue-router').NavigationGuardNext} next
   */
  function nextNotFound(next) {
    const title = i18n.global.t('error.notFound')
    next({ name: 'error', state: { title } })
  }

  /**
   * Returns true if any matched route record has `meta.skipsAuth`.
   * @param {import('vue-router').RouteLocationNormalized} to
   * @returns {boolean}
   */
  function routeSkipsAuth(to) {
    return to.matched.some((r) => get(r, 'meta.skipsAuth', false))
  }

  /**
   * Handles navigation for an authenticated user. If a redirect was stored
   * before login, navigates there instead of the original target.
   * @param {import('vue-router').RouteLocationNormalized} to
   * @param {import('vue-router').NavigationGuardNext} next
   */
  function proceedAuthenticated(to, next) {
    const appStore = useAppStore()
    const path = appStore.popRedirectAfterLogin()
    if (to.path !== path && path !== null) {
      next({ path })
    } else {
      next()
    }
  }

  /**
   * Handles navigation for an unauthenticated user. Stores the intended
   * destination and redirects to the login page, unless already on it.
   * @param {import('vue-router').RouteLocationNormalized} to
   * @param {import('vue-router').RouteLocationNormalized} from
   * @param {import('vue-router').NavigationGuardNext} next
   */
  function proceedUnauthenticated(to, from, next) {
    const appStore = useAppStore()
    if (from.name !== 'login' && to.name !== 'login') {
      appStore.setRedirectAfterLogin(to.path)
      next({ name: 'login' })
    } else {
      next()
    }
  }

  /**
   * Verifies the user is authenticated via cookie. Routes with `meta.skipsAuth`
   * bypass this check. Unauthenticated users are redirected to the login page,
   * with their original destination stored for redirect after login.
   * @param {import('vue-router').RouteLocationNormalized} to
   * @param {import('vue-router').RouteLocationNormalized} from
   * @param {import('vue-router').NavigationGuardNext} next
   */
  async function checkUserAuthentication(to, from, next) {
    try {
      if (routeSkipsAuth(to)) {
        return next()
      }
      const username = await auth.getUsername()
      if (username) {
        proceedAuthenticated(to, next)
      } else {
        proceedUnauthenticated(to, from, next)
      }
    } catch (error) {
      next({ name: 'error', state: { error } })
    }
  }

  /**
   * Ensures the user has at least one project assigned. If no projects are
   * configured and the target route is not the error or login page, the user
   * is redirected to an error page.
   * @param {import('vue-router').RouteLocationNormalized} to
   * @param {import('vue-router').RouteLocationNormalized} from
   * @param {import('vue-router').NavigationGuardNext} next
   */
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

  /**
   * Resets the page context and sets the page title from the route's `meta.title`.
   * The title can be a translation key string or an async function receiving the
   * core instance.
   * @param {import('vue-router').RouteLocationNormalized} to
   * @param {import('vue-router').RouteLocationNormalized} _from
   * @param {import('vue-router').NavigationGuardNext} next
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
   * Resolves the project name from the route using `meta.projectParam`.
   * Returns null if the route doesn't declare a project param or if the
   * param is missing from the URL.
   * @param {import('vue-router').RouteMeta} meta
   * @param {Record<string, string>} params
   * @returns {string|null}
   */
  function getProjectFromRoute(meta, params) {
    const projectParam = meta.projectParam
    if (!projectParam || !params[projectParam]) {
      return null
    }
    return params[projectParam]
  }

  /**
   * Returns true if the user has at least one of the required roles for
   * the given project.
   * @param {string[]} allowedRoles
   * @param {string} projectName
   * @returns {boolean}
   */
  function hasRequiredRole(allowedRoles, projectName) {
    const currentRoles = getRolesByProject(projectName)
    return allowedRoles.some((role) => currentRoles.includes(role))
  }

  /**
   * Enforces role-based access control on routes in SERVER mode. Routes that
   * require specific roles must declare both `meta.allowedRoles` (e.g. `['ADMIN']`)
   * and `meta.projectParam` (the route param name holding the project identifier,
   * e.g. `'name'`). The guard looks up the user's roles for that project and
   * allows access only if at least one role matches. Skipped entirely in
   * LOCAL/EMBEDDED modes where there is no role enforcement.
   * @param {import('vue-router').RouteLocationNormalized} to
   * @param {import('vue-router').RouteLocationNormalized} _from
   * @param {import('vue-router').NavigationGuardNext} next
   */
  function checkUserRoles({ meta, params }, _from, next) {
    if (!isServer.value) {
      return next()
    }
    const allowedRoles = get(meta, 'allowedRoles', [])
    if (allowedRoles.length === 0) {
      return next()
    }
    const projectName = getProjectFromRoute(meta, params)
    if (!projectName || !hasRequiredRole(allowedRoles, projectName)) {
      return nextNotFound(next)
    }
    next()
  }

  /**
   * Restricts routes to specific application modes. If a route declares
   * `meta.allowedModes` (e.g. `['LOCAL', 'EMBEDDED']`), navigation is only
   * allowed when the current mode is in that list. Routes without
   * `allowedModes` are accessible in all modes.
   * @param {import('vue-router').RouteLocationNormalized} to
   * @param {import('vue-router').RouteLocationNormalized} _from
   * @param {import('vue-router').NavigationGuardNext} next
   */
  function checkMode({ meta }, _from, next) {
    const currentMode = config.get('mode')
    const allowedModes = get(meta, 'allowedModes', [])
    if (allowedModes.length === 0 || allowedModes.includes(currentMode)) {
      next()
    } else {
      nextNotFound(next)
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
