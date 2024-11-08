import { computed } from 'vue'

import { useCore } from '@/composables/core'
import { MODE_NAME } from '@/mode'

export function useMode() {
  const { core } = useCore()
  const isServer = computed(() => core.config.get('mode') === MODE_NAME.SERVER)

  return { isServer }
}

export default useMode
