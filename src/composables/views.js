import { computed } from 'vue'

import { useAppStore } from '@/store/modules/app'

export function useViews() {
  const appStore = useAppStore()

  const isSidebarClosed = computed(() => appStore.sidebar.closed)

  const toggleSidebar = computed({
    get: () => !isSidebarClosed.value,
    set: (value) => (appStore.sidebar.closed = !value)
  })

  const isSettingsClosed = computed(() => appStore.settings.closed)

  const toggleSettings = computed({
    get: () => !isSettingsClosed.value,
    set: (value) => (appStore.settings.closed = !value)
  })

  const isFiltersClosed = computed(() => appStore.filters.closed)

  const toggleFilters = computed({
    get: () => !isFiltersClosed.value,
    set: (value) => (appStore.filters.closed = !value)
  })

  return { isSidebarClosed, toggleSidebar, isSettingsClosed, toggleSettings, isFiltersClosed, toggleFilters }
}
