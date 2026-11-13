import { computed, ref, onBeforeMount } from 'vue'

import { useCore } from './useCore'

const AUTH_MODE_PWD = ['form', 'basic']
const AUTH_MODE_BASIC = ['basic', 'yesBasic']
const BASIC_AUTH_FILTER = 'org.icij.datashare.session.BasicAuthAdaptorFilter'

export function useAuth() {
  const core = useCore()

  const username = ref(null)
  const isUsernameResolved = ref(false)
  const isAuthenticated = computed(() => !!username.value)
  const isBasicAuthMode = computed(() => {
    const auth = core.config.get('auth')
    if (auth !== undefined && auth !== null) {
      return AUTH_MODE_BASIC.includes(auth)
    }
    return core.config.get('authFilter') === BASIC_AUTH_FILTER
  })
  const isBasicAuth = computed(() => isAuthenticated.value && isBasicAuthMode.value)
  const isAuthWithUsersProvider = computed(() => AUTH_MODE_PWD.includes(core.config.get('auth')))
  // Whether uid is the viewer. Until the username resolves, any uid counts as the viewer, so a
  // guard on the viewer's own account can't be bypassed in the meantime.
  const isCurrentUser = uid => !isUsernameResolved.value || username.value === uid

  onBeforeMount(async () => {
    username.value = await core?.auth.getUsername()
    isUsernameResolved.value = true
  })

  return { username, isBasicAuth, isUsernameResolved, isAuthenticated, isAuthWithUsersProvider, isCurrentUser }
}

export default useAuth
