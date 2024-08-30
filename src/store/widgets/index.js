import types from '@/utils/types'

export { default as WidgetDiskUsage } from './WidgetDiskUsage'
export { default as WidgetDocumentsByCreationDateByPath } from './WidgetDocumentsByCreationDateByPath'
export { default as WidgetEmpty } from './WidgetEmpty'
export { default as WidgetEntities } from './WidgetEntities'
export { default as WidgetFileBarometer } from './WidgetFileBarometer'
export { default as WidgetProject } from './WidgetProject'
export { default as WidgetSearchBar } from './WidgetSearchBar'
export { default as WidgetText } from './WidgetText'
export { default as WidgetTreeMap } from './WidgetTreeMap'
export { default as WidgetFieldFacets } from './WidgetFieldFacets'
export { default as WidgetRecommendedBy } from './WidgetRecommendedBy'
export { default as WidgetNested } from './WidgetNested'

const widgets = [
  {
    name: 'search-bar',
    order: 5,
    card: true,
    cols: 12,
    type: 'WidgetSearchBar'
  },
  {
    name: 'project-and-files',
    order: 15,
    card: false,
    cols: 6,
    type: 'WidgetNested',
    widgets: [
      {
        name: 'project',
        card: true,
        cols: 12,
        type: 'WidgetProject'
      },
      {
        name: 'file-barometer',
        card: true,
        cols: 6,
        type: 'WidgetFileBarometer'
      },
      {
        name: 'disk-usage',
        card: true,
        cols: 6,
        type: 'WidgetDiskUsage'
      }
    ]
  },
  {
    name: 'recommended-by',
    order: 25,
    card: true,
    cols: 6,
    type: 'WidgetRecommendedBy'
  },
  {
    name: 'entities',
    order: 35,
    card: true,
    cols: 12,
    type: 'WidgetEntities'
  },
  {
    name: 'documents-by-creation-date',
    order: 40,
    card: true,
    cols: 12,
    type: 'WidgetDocumentsByCreationDateByPath',
    title: 'Number of documents by creation date'
  },
  {
    name: 'languages',
    order: 60,
    icon: 'language',
    card: true,
    cols: 4,
    field: 'language',
    routeQueryField: 'f[language]',
    bucketTranslation: ({ key }) => `filter.lang.${key}`,
    type: 'WidgetFieldFacets'
  },
  {
    name: 'content-types',
    order: 60,
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
    icon: 'file-signature',
    card: true,
    cols: 4,
    field: 'metadata.tika_metadata_dc_creator.keyword',
    routeQueryField: null,
    type: 'WidgetFieldFacets'
  }
]

export default widgets
