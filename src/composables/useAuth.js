import { computed, ref, onBeforeMount } from 'vue'

import { useCore } from './useCore'

const AUTH_MODE_PWD = ['form', 'basic']

export function useAuth() {
  const core = useCore()

  const username = ref(null)
  const isBasicAuth = ref(null)
  const isUsernameResolved = ref(false)
  const isAuthenticated = computed(() => !!username.value)
  const isAuthWithUsersProvider = computed(() => AUTH_MODE_PWD.includes(core.config.get('auth')))

  onBeforeMount(async () => {
    username.value = await core?.auth.getUsername()
    isBasicAuth.value = await core?.auth.isBasicAuth()
    isUsernameResolved.value = true
  })

  return { username, isBasicAuth, isUsernameResolved, isAuthenticated, isAuthWithUsersProvider }
}

export default useAuth
