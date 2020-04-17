export { default as WidgetEmpty } from './WidgetEmpty'
export { default as WidgetFileBarometer } from './WidgetFileBarometer'
export { default as WidgetDocumentsByCreationDate } from './WidgetDocumentsByCreationDate.js'
export { default as WidgetText } from './WidgetText'

export default [
  { card: true, cols: 8, type: 'WidgetText', title: 'Insights' },
  { card: true, cols: 4, type: 'WidgetFileBarometer' },
  { card: true, cols: 12, type: 'WidgetDocumentsByCreationDate', title: 'Number of documents by creation date' }
]
