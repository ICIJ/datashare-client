import { computed, ref, onBeforeMount } from 'vue'

import { useCore } from './useCore'

export function useAuth() {
  const core = useCore()

  const username = ref(null)
  const isBasicAuth = ref(null)
  const isAuthenticated = computed(() => !!username.value)

  onBeforeMount(async () => {
    username.value = await core?.auth.getUsername()
    isBasicAuth.value = await core?.auth.isBasicAuth()
  })

  return { username, isBasicAuth, isAuthenticated }
}

export default useAuth
