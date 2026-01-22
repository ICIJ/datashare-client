import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhImage from '~icons/ph/image'
import IPhFileText from '~icons/ph/file-text'
import IPhQuotes from '~icons/ph/quotes'
import IPhUserCircle from '~icons/ph/user-circle'
import IPhTreeStructure from '~icons/ph/tree-structure'
import IPhHash from '~icons/ph/hash'
import IPhFloppyDiskBack from '~icons/ph/floppy-disk-back'
import IPhTextColumns from '~icons/ph/text-columns'
import IPhFile from '~icons/ph/file'
import IPhCalendar from '~icons/ph/calendar'
import IPhCalendarPlus from '~icons/ph/calendar-plus'
import IPhPaperclip from '~icons/ph/paperclip'
import IPhGlobeHemisphereWest from '~icons/ph/globe-hemisphere-west'
import IPhCirclesThreePlus from '~icons/ph/circles-three-plus'
import IPhFiles from '~icons/ph/files'

import { useViewProperties } from '@/composables/useViewProperties'
import { SORT_TYPE_KEY, useViewSettings } from '@/composables/useViewSettings'

// Module-level cache for memoized search properties
let cachedProperties = null

export function useSearchProperties() {
  // Return cached properties if available
  if (cachedProperties) {
    return cachedProperties
  }

  const { t } = useI18n()
  const { propertyItem } = useViewProperties()
  const { fieldsToSortByOptions, fieldsToPropertiesOptions } = useViewSettings()

  const relevance = propertyItem({
    key: 'relevance',
    text: computed(() => t('documentRow.properties.relevance')),
    sortable: true,
    type: SORT_TYPE_KEY.NUMBER,
    sortingKey: '_score'
  })

  const thumbnail = propertyItem({
    icon: IPhImage,
    key: 'thumbnail',
    emphasis: true,
    text: computed(() => t('documentRow.properties.thumbnail'))
  })

  const title = propertyItem({
    icon: IPhFileText,
    key: 'title',
    required: true,
    emphasis: true,
    sortable: true,
    sortingKey: 'titleNorm',
    type: SORT_TYPE_KEY.ALPHA,
    text: computed(() => t('documentRow.properties.title'))
  })

  const highlights = propertyItem({
    icon: IPhQuotes,
    key: 'highlights',
    text: computed(() => t('documentRow.properties.highlights'))
  })

  const author = propertyItem({
    icon: IPhUserCircle,
    key: 'author',
    text: computed(() => t('documentRow.properties.author'))
  })

  const path = propertyItem({
    icon: IPhTreeStructure,
    key: 'path',
    sortable: true,
    type: SORT_TYPE_KEY.ALPHA,
    text: computed(() => t('documentRow.properties.path'))
  })

  const tags = propertyItem({
    icon: IPhHash,
    key: 'tags',
    text: computed(() => t('documentRow.properties.tags'))
  })

  const contentLength = propertyItem({
    icon: IPhFloppyDiskBack,
    key: 'contentLength',
    sortable: true,
    type: SORT_TYPE_KEY.NUMBER,
    text: computed(() => t('documentRow.properties.contentLength'))
  })

  const contentTextLength = propertyItem({
    icon: IPhTextColumns,
    key: 'contentTextLength',
    type: SORT_TYPE_KEY.NUMBER,
    text: computed(() => t('documentRow.properties.contentTextLength'))
  })

  const contentType = propertyItem({
    icon: IPhFile,
    key: 'contentType',
    text: computed(() => t('documentRow.properties.contentType'))
  })

  const creationDate = propertyItem({
    icon: IPhCalendar,
    key: 'creationDate',
    type: SORT_TYPE_KEY.DATE,
    sortable: true,
    sortingKey: 'metadata.tika_metadata_dcterms_created',
    text: computed(() => t('documentRow.properties.creationDate'))
  })

  const extractionDate = propertyItem({
    icon: IPhCalendarPlus,
    key: 'extractionDate',
    type: SORT_TYPE_KEY.DATE,
    sortable: true,
    text: computed(() => t('documentRow.properties.extractionDate'))
  })

  const extractionLevel = propertyItem({
    icon: IPhPaperclip,
    key: 'extractionLevel',
    text: computed(() => t('documentRow.properties.extractionLevel'))
  })

  const language = propertyItem({
    icon: IPhGlobeHemisphereWest,
    key: 'language',
    text: computed(() => t('documentRow.properties.language'))
  })

  const project = propertyItem({
    icon: IPhCirclesThreePlus,
    key: 'project',
    text: computed(() => t('documentRow.properties.project'))
  })

  const numberOfPages = propertyItem({
    icon: IPhFiles,
    key: 'numberOfPages',
    text: computed(() => t('document.numberOfPages'))
  })

  const items = {
    thumbnail,
    title,
    highlights,
    author,
    path,
    tags,
    contentLength,
    contentTextLength,
    contentType,
    creationDate,
    extractionLevel,
    language,
    project,
    numberOfPages
  }

  const fields = Object.values(items)
  const sortByOptions = fieldsToSortByOptions([relevance, ...fields, extractionDate])
  const propertiesOptions = fieldsToPropertiesOptions(fields)

  // Cache the result for subsequent calls
  cachedProperties = { items, fields, propertiesOptions, sortByOptions }

  return cachedProperties
}
