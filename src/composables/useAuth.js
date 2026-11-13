import { computed, ref, onBeforeMount } from 'vue'

import { useCore } from './useCore'

const AUTH_MODE_PWD = ['form', 'basic']
const AUTH_MODE_BASIC = ['basic', 'yesBasic']
const AUTH_MODE_BY_FILTER = {
  'org.icij.datashare.session.BasicAuthAdaptorFilter': 'basic',
  'org.icij.datashare.session.FormAuthFilter': 'form'
}

export function useAuth() {
  const core = useCore()

  const username = ref(null)
  const isUsernameResolved = ref(false)
  const isUsernameUnavailable = ref(false)
  const isAuthenticated = computed(() => !!username.value)
  // The `auth` setting (e.g. `--auth form`) takes precedence over the legacy `authFilter` setting.
  const authMode = computed(() => {
    const authFilterMode = AUTH_MODE_BY_FILTER[core.config.get('authFilter')]
    return core.config.get('auth') ?? authFilterMode
  })
  const isBasicAuthMode = computed(() => AUTH_MODE_BASIC.includes(authMode.value))
  const isBasicAuth = computed(() => isAuthenticated.value && isBasicAuthMode.value)
  const isAuthWithUsersProvider = computed(() => AUTH_MODE_PWD.includes(authMode.value))
  // Whether uid is the viewer. Until the username is known, any uid counts as the viewer, so a
  // guard on the viewer's own account can't be bypassed in the meantime.
  const isUsernameKnown = computed(() => isUsernameResolved.value && !isUsernameUnavailable.value)
  const isCurrentUser = uid => !isUsernameKnown.value || username.value === uid

  async function resolveUsername() {
    try {
      username.value = await core?.auth.whoAmI()
    }
    catch {
      isUsernameUnavailable.value = true
    }
    isUsernameResolved.value = true
  }

  onBeforeMount(resolveUsername)

  return {
    username,
    authMode,
    isBasicAuth,
    isUsernameResolved,
    isUsernameUnavailable,
    isAuthenticated,
    isAuthWithUsersProvider,
    isCurrentUser
  }
}

export default useAuth
