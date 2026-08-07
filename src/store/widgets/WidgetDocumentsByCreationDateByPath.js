import { defineAsyncComponent } from 'vue'
import WidgetDocumentsByCreationDate from './WidgetDocumentsByCreationDate'

// See WidgetEmpty.js for why this is lazy.
const Component = defineAsyncComponent(() => import('@/components/Widget/WidgetDocumentsByCreationDateByPath'))

/**
 * Widget to display number of files by creation date by path
 */
class WidgetDocumentsByCreationDateByPath extends WidgetDocumentsByCreationDate {
  get component() {
    return Component
  }
}

export default WidgetDocumentsByCreationDateByPath
