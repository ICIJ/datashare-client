import { useI18n } from 'vue-i18n'

/**
 * Returns a resolver that maps a content-type category key (e.g. "DOCUMENT")
 * to its human-readable label via `filter.contentTypeCategoryItem.<KEY>`. Falls
 * back to the raw key when no translation is registered.
 *
 * @returns {(categoryKey: string) => string}
 */
const translationKeyFor = categoryKey => `filter.contentTypeCategoryItem.${categoryKey}`

export function useContentTypeCategoryLabel() {
  const { t, te } = useI18n()

  const resolveLabel = (categoryKey) => {
    const key = translationKeyFor(categoryKey)
    if (te(key)) {
      return t(key)
    }
    return categoryKey
  }

  return resolveLabel
}
