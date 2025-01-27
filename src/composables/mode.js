import { computed } from 'vue'

import { useCore } from '@/composables/core'
import { MODE_NAME } from '@/mode'

export function useMode() {
  const { core } = useCore()
  const mode = computed(() => core.mode)
  const isServer = computed(() => mode.value.modeName === MODE_NAME.SERVER)

  return { mode, isServer }
}

export default useMode
