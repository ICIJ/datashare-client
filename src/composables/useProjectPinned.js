import { computed, toValue } from 'vue'

import { useAppStore } from '@/store/modules'

export function useProjectPinned(project) {
  const appStore = useAppStore()
  const { name } = toValue(project)

  const pinned = computed({
    get() {
      return appStore.isProjectPinned(name)
    },
    set(pinned) {
      if (pinned) {
        return appStore.pinProject(name)
      }

      return appStore.unpinProject(name)
    }
  })

  return { pinned }
}
