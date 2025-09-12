import types from '@/utils/contentTypes.json'
import { MODE_NAME } from '@/mode'

export { default as WidgetDiskUsage } from './WidgetDiskUsage'
export { default as WidgetDetails } from './WidgetDetails'
export { default as WidgetDocuments } from './WidgetDocuments'
export { default as WidgetDocumentsByCreationDateByPath } from './WidgetDocumentsByCreationDateByPath'
export { default as WidgetEmpty } from './WidgetEmpty'
export { default as WidgetEntities } from './WidgetEntities'
export { default as WidgetPaths } from './WidgetPaths'
export { default as WidgetProject } from './WidgetProject'
export { default as WidgetSearchBar } from './WidgetSearchBar'
export { default as WidgetText } from './WidgetText'
export { default as WidgetFieldFacets } from './WidgetFieldFacets'
export { default as WidgetRecommendedBy } from './WidgetRecommendedBy'
export { default as WidgetNested } from './WidgetNested'

const widgets = [
  {
    name: 'docuents-and-disk-usage',
    order: 20,
    card: false,
    cols: 5,
    type: 'WidgetNested',
    widgets: [
      {
        name: 'file-barometer',
        card: false,
        cols: 8,
        type: 'WidgetDocuments'
      },
      {
        name: 'disk-usage',
        card: false,
        cols: 4,
        type: 'WidgetDiskUsage'
      }
    ]
  },
  {
    name: 'entities',
    order: 30,
    card: false,
    cols: 7,
    type: 'WidgetEntities'
  },
  {
    name: 'documents-by-creation-date',
    order: 40,
    card: true,
    cols: 12,
    type: 'WidgetDocumentsByCreationDateByPath'
  },
  {
    name: 'languages',
    order: 40,
    icon: 'globe-hemisphere-west',
    card: true,
    cols: 4,
    field: 'language',
    routeQueryField: 'f[language]',
    bucketTranslation: ({ key }) => `filter.lang.${key}`,
    type: 'WidgetFieldFacets'
  },
  {
    name: 'content-types',
    order: 50,
    icon: 'file',
    card: true,
    cols: 4,
    field: 'contentType',
    routeQueryField: 'f[contentType]',
    bucketTranslation: ({ key }) => types[key]?.label ?? key,
    type: 'WidgetFieldFacets'
  },
  {
    name: 'authors',
    order: 60,
    icon: 'user-circle',
    card: true,
    cols: 4,
    field: 'metadata.tika_metadata_dc_creator.keyword',
    routeQueryField: null,
    type: 'WidgetFieldFacets'
  },
  {
    name: 'recommended-by',
    order: 70,
    card: true,
    cols: 12,
    type: 'WidgetRecommendedBy',
    modes: [MODE_NAME.SERVER]
  },
  {
    name: 'paths',
    section: 'paths',
    card: true,
    cols: 12,
    type: 'WidgetPaths'
  },
  {
    name: 'details',
    section: 'details',
    card: true,
    cols: 12,
    type: 'WidgetDetails'
  }
]

export default widgets
