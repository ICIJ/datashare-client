import { useI18n } from 'vue-i18n'

/**
 * Returns a resolver that maps a content-type category key (e.g. "DOCUMENT")
 * to its human-readable label via `filter.contentTypeCategory.<KEY>`. Falls
 * back to the raw key when no translation is registered.
 *
 * @returns {(categoryKey: string) => string}
 */
export function useContentTypeCategoryLabel() {
  const { t, te } = useI18n()
  return (categoryKey) => {
    const key = `filter.contentTypeCategory.${categoryKey}`
    return te(key) ? t(key) : categoryKey
  }
}
