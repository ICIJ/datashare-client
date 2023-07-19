export { default as WidgetDiskUsage } from './WidgetDiskUsage'
export { default as WidgetDocumentsByCreationDateByPath } from './WidgetDocumentsByCreationDateByPath'
export { default as WidgetDuplicates } from './WidgetDuplicates'
export { default as WidgetEmpty } from './WidgetEmpty'
export { default as WidgetEntities } from './WidgetEntities'
export { default as WidgetFileBarometer } from './WidgetFileBarometer'
export { default as WidgetListGroup } from './WidgetListGroup'
export { default as WidgetNames } from './WidgetNames'
export { default as WidgetSearchBar } from './WidgetSearchBar'
export { default as WidgetText } from './WidgetText'
export { default as WidgetTreeMap } from './WidgetTreeMap'

const widgets = [
  {
    name: 'search-bar',
    order: 5,
    card: true,
    cols: 12,
    type: 'WidgetSearchBar'
  },
  {
    name: 'default-text',
    order: 10,
    card: true,
    cols: 6,
    type: 'WidgetDuplicates',
    title: 'Number of duplicates in your documents'
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
  }
]

export default widgets
