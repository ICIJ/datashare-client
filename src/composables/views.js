import { computed } from 'vue'
import { useStore } from 'vuex'

export function useViews() {
  const store = useStore()

  const toggleSidebar = computed({
    get: () => !store?.state.app.sidebar.closed,
    set: (value) => store?.dispatch('app/toggleSidebarClosed', !value)
  })

  const toggleSettings = computed({
    get: () => !store?.state.app.settings.closed,
    set: (value) => store?.dispatch('app/toggleSettingsClosed', !value)
  })

  const toggleFilters = computed({
    get: () => !store?.state.app.filters.closed,
    set: (value) => store?.dispatch('app/toggleFiltersClosed', !value)
  })

  return { toggleSidebar, toggleSettings, toggleFilters }
}
