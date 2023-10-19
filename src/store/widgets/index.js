import types from '@/utils/types'

export { default as WidgetDiskUsage } from './WidgetDiskUsage'
export { default as WidgetDocumentsByCreationDateByPath } from './WidgetDocumentsByCreationDateByPath'
export { default as WidgetDuplicates } from './WidgetDuplicates'
export { default as WidgetEmpty } from './WidgetEmpty'
export { default as WidgetEntities } from './WidgetEntities'
export { default as WidgetFileBarometer } from './WidgetFileBarometer'
export { default as WidgetListGroup } from './WidgetListGroup'
export { default as WidgetNames } from './WidgetNames'
export { default as WidgetProject } from './WidgetProject'
export { default as WidgetSearchBar } from './WidgetSearchBar'
export { default as WidgetText } from './WidgetText'
export { default as WidgetTreeMap } from './WidgetTreeMap'
export { default as WidgetFieldFacets } from './WidgetFieldFacets'

const widgets = [
  {
    name: 'search-bar',
    order: 5,
    card: true,
    cols: 12,
    type: 'WidgetSearchBar'
  },
  {
    name: 'project',
    order: 10,
    card: true,
    cols: 6,
    type: 'WidgetProject'
  },
  {
    name: 'file-barometer',
    order: 20,
    card: true,
    cols: 3,
    type: 'WidgetFileBarometer'
  },
  {
    name: 'disk-usage',
    order: 30,
    card: true,
    cols: 3,
    type: 'WidgetDiskUsage'
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
    order: 50,
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
    order: 50,
    icon: 'users',
    card: true,
    cols: 4,
    field: 'metadata.tika_metadata_dc_creator.keyword',
    routeQueryField: null,
    type: 'WidgetFieldFacets'
  }
]

export default widgets
