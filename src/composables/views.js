import { computed } from 'vue'
import { useStore } from 'vuex'

export function useViews() {
  const store = useStore()

  const isSidebarClosed = computed(() => store?.state.app.sidebar.closed)

  const toggleSidebar = computed({
    get: () => !isSidebarClosed.value,
    set: (value) => store?.dispatch('app/toggleSidebarClosed', !value)
  })

  const isSettingsClosed = computed(() => store?.state.app.settings.closed)

  const toggleSettings = computed({
    get: () => !isSettingsClosed.value,
    set: (value) => store?.dispatch('app/toggleSettingsClosed', !value)
  })

  const isFiltersClosed = computed(() => store?.state.app.filters.closed)

  const toggleFilters = computed({
    get: () => !isFiltersClosed.value,
    set: (value) => store?.dispatch('app/toggleFiltersClosed', !value)
  })

  return { isSidebarClosed, toggleSidebar, isSettingsClosed, toggleSettings, isFiltersClosed, toggleFilters }
}
