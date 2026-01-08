import { computed, toRef } from 'vue'

import { useAppStore } from '@/store/modules'

export function useProjectPinned(project) {
  const appStore = useAppStore()
  const projectRef = toRef(project)

  const pinned = computed({
    get() {
      const { name } = projectRef.value
      return appStore.isProjectPinned(name)
    },
    set(pinned) {
      const { name } = projectRef.value

      if (pinned) {
        return appStore.pinProject(name)
      }

      return appStore.unpinProject(name)
    }
  })

  return { pinned }
}
