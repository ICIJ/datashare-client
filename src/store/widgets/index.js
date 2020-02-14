export { default as WidgetEmpty } from './WidgetEmpty'
export { default as WidgetFileBarometer } from './WidgetFileBarometer'
export { default as WidgetText } from './WidgetText'

export default [
  { card: true, cols: 8, type: 'WidgetText', title: 'Insights' },
  { card: true, cols: 4, type: 'WidgetFileBarometer' },
  { card: true, cols: 4 },
  { card: true, cols: 4 },
  { card: true, cols: 4 },
  { card: true, cols: 12 }
]
