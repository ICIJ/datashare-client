import { defineAsyncComponent } from 'vue'
import WidgetText from './WidgetText'

// See WidgetEmpty.js for why this is lazy — this one in particular is what
// pulls in ColumnChartPicker/d3, the finding that prompted this change.
const Component = defineAsyncComponent(() => import('@/components/Widget/WidgetDocumentsByCreationDate'))

/**
 * Widget to display the number of file by creation date on the insights page.
 */
class WidgetDocumentsByCreationDate extends WidgetText {
  get component() {
    return Component
  }
}

export default WidgetDocumentsByCreationDate
