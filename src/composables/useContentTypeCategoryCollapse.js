import { computed } from 'vue'
import { without } from 'lodash'

import { useAppStore } from '@/store/modules'

const SETTINGS_VIEW = 'search'
const SETTINGS_NAME = 'expandedContentTypeCategories'

/**
 * Per-category collapse state for the grouped file-types filter.
 *
 * Categories are collapsed by default. The persisted setting stores the
 * EXPANDED category keys (not the collapsed ones) so the empty default matches
 * the collapsed-by-default behavior and existing users need no migration.
 *
 * @returns {{
 *   isCollapsed: (category: string) => boolean,
 *   toggleCollapse: (category: string, collapsed: boolean) => void
 * }}
 */
export function useContentTypeCategoryCollapse() {
  const appStore = useAppStore()

  const expanded = computed(() => appStore.getSettings(SETTINGS_VIEW, SETTINGS_NAME) ?? [])

  const isCollapsed = category => !expanded.value.includes(category)

  const toggleCollapse = (category, collapsed) => {
    const current = expanded.value
    const next = collapsed
      ? without(current, category)
      : current.includes(category) ? current : [...current, category]
    appStore.setSettings(SETTINGS_VIEW, SETTINGS_NAME, next)
  }

  return { isCollapsed, toggleCollapse }
}
