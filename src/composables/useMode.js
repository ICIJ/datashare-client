import { computed, toValue } from 'vue'

import { useCore } from '@/composables/useCore'
import { MODE_NAME } from '@/mode'

export function useMode(coreValue) {
  const core = toValue(coreValue) ?? useCore()
  const mode = computed(() => core.mode)
  const modeName = computed(() => mode.value.modeName)
  const isServer = computed(() => modeName.value === MODE_NAME.SERVER)
  const isLocal = computed(() => modeName.value === MODE_NAME.LOCAL)
  const isEmbedded = computed(() => modeName.value === MODE_NAME.EMBEDDED)
  const isMode = name => modeName.value === name.toUpperCase()

  return { mode, modeName, isServer, isLocal, isEmbedded, isMode }
}

export default useMode
