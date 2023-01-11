import Component from '@/components/widget/WidgetDocumentsByCreationDate'
import WidgetText from './WidgetText'

/**
 * Widget to display the number of file by creation date on the insights page.
 */
class WidgetDocumentsByCreationDate extends WidgetText {
  get component() {
    return Component
  }
}

export default WidgetDocumentsByCreationDate
