import { get, isString, isFunction } from 'lodash'

import { useAppStore } from '@/store/modules'
import { useNProgress } from '@/composables/useNProgress'
import { usePolicies } from '@/composables/usePolicies.js'
import useMode from '@/composables/useMode.js'

export default (core) => {
  const { router, auth, config, i18n } = core
  const { isServer } = useMode(core)
  const { getRolesByProject } = usePolicies()
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

  function checkUserRoles({ meta }, _from, next) {
    if (!isServer.value) {
      return next()
    }
    const currentRoles = getRolesByProject('local-datashare')
    const allowedRoles = get(meta, 'allowedRoles', [])
    const hasOneRole = allowedRoles.some(role => currentRoles.includes(role))
    if (allowedRoles.length === 0 || hasOneRole) {
      next()
    }
    else {
      const title = i18n.global.t('error.notFound')
      next({ name: 'error', state: { title } })
    }
  }

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

  function startProgress() {
    const { start } = useNProgress()
    start()
  }

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
