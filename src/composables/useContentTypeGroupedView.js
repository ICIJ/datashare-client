import { computed } from 'vue'

import { useAppStore } from '@/store/modules'

const SETTINGS_VIEW = 'search'
const SETTINGS_NAME = 'groupedContentTypeView'

/**
 * Persisted grouped (categories) vs flat (list) view preference for the
 * file-types filter. Flat is the default. Stored globally under the `search`
 * settings view, mirroring useContentTypeCategoryCollapse.
 *
 * @returns {import('vue').WritableComputedRef<boolean>}
 */
export function useContentTypeGroupedView() {
  const appStore = useAppStore()

  return computed({
    get: () => appStore.getSettings(SETTINGS_VIEW, SETTINGS_NAME) ?? false,
    set: value => appStore.setSettings(SETTINGS_VIEW, SETTINGS_NAME, value)
  })
}
