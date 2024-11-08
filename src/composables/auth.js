import { ref, onBeforeMount } from 'vue'

import { useCore } from './core'

export function useAuth() {
  const { core } = useCore()
  const username = ref(null)

  onBeforeMount(async () => {
    username.value = await core.auth.getUsername()
  })

  return { username }
}

export default useAuth
