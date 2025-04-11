import { useViewSettings } from '@/composables/useViewSettings'
import { useSearchProperties } from '@/composables/useSearchProperties.js'
export function useSearchHistoryProperties() {
  const { items: searchItems } = useSearchProperties()
  const { fieldsToSortByOptions, fieldsToPropertiesOptions } = useViewSettings()
  const {
    thumbnail,
    title,
    author,
    path,
    tags,
    contentLength,
    contentTextLength,
    contentType,
    creationDate,
    extractionLevel,
    language,
    project
  } = searchItems
  const items = {
    thumbnail,
    title,
    author,
    path,
    tags,
    contentLength,
    contentTextLength,
    contentType,
    creationDate,
    extractionLevel,
    language,
    project
  }
  const fields = Object.values(items)
  const sortByOptions = fieldsToSortByOptions(fields)

  const propertiesOptions = fieldsToPropertiesOptions(fields)
  return { items, fields, propertiesOptions, sortByOptions }
}
