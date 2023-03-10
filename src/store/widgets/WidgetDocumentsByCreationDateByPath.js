import WidgetDocumentsByCreationDate from './WidgetDocumentsByCreationDate'

import Component from '@/components/widget/WidgetDocumentsByCreationDateByPath'

/**
 * Widget to display number of files by creation date by path
 */
class WidgetDocumentsByCreationDateByPath extends WidgetDocumentsByCreationDate {
  get component() {
    return Component
  }
}

export default WidgetDocumentsByCreationDateByPath
