export { default as WidgetDiskUsage } from './WidgetDiskUsage'
export { default as WidgetDocumentsByCreationDate } from './WidgetDocumentsByCreationDate'
export { default as WidgetDocumentsByCreationDateByPath } from './WidgetDocumentsByCreationDateByPath'
export { default as WidgetEmpty } from './WidgetEmpty'
export { default as WidgetFileBarometer } from './WidgetFileBarometer'
export { default as WidgetText } from './WidgetText'

const widgets = [
  { name: 'default-text', card: true, cols: 6, type: 'WidgetText', title: 'Insights' },
  { name: 'file-barometer', card: true, cols: 3, type: 'WidgetFileBarometer' },
  { name: 'disk-usage', card: true, cols: 3, type: 'WidgetDiskUsage' },
  { name: 'documents-by-creation-date', card: true, cols: 12, type: 'WidgetDocumentsByCreationDateByPath', title: 'Number of documents by creation date' }
]

export default widgets
