import { computed } from 'vue'

import { useCore } from '@/composables/useCore'
import { MODE_NAME } from '@/mode'

export function useMode() {
  const { core } = useCore()
  const mode = computed(() => core.mode)
  const isServer = computed(() => mode.value.modeName === MODE_NAME.SERVER)
  const isLocal = computed(() => mode.value.modeName === MODE_NAME.LOCAL)
  const isEmbedded = computed(() => mode.value.modeName === MODE_NAME.EMBEDDED)
  const isMode = (name) => mode.value.modeName === name.toUpperCase()

  return { mode, isServer, isLocal, isEmbedded, isMode }
}

export default useMode
