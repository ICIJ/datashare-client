import { computed, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { compact } from 'lodash'

import allShortcuts from '@/utils/keyboardShortcuts.json'

export const useKeyboardShortcuts = () => {
  const route = useRoute()

  const matchedRoutes = computed(() => {
    return compact(route.matched.map((match) => match.name))
  })

  const routeShortcuts = computed(() => {
    return allShortcuts.filter(({ route = null }) => !route || matchedRoutes.value.includes(route))
  })

  const shortcuts = toRef(allShortcuts)

  return { routeShortcuts, shortcuts }
}
