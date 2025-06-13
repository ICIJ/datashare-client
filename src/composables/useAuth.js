import { computed, ref, onBeforeMount } from 'vue'

import { useCore } from './useCore'

export function useAuth() {
  const { core } = useCore()

  const username = ref(null)
  const isAuthenticated = computed(() => !!username.value)

  onBeforeMount(async () => {
    username.value = await core.auth.getUsername()
  })

  return { username, isAuthenticated }
}

export default useAuth
