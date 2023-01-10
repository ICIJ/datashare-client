import Component from '@/components/widget/WidgetDuplicates'
import WidgetText from './WidgetText'

/**
 * Widget for the insights page indicating the proportion of duplicates in the data.
 */
class WidgetDuplicates extends WidgetText {
  get component() {
    return Component
  }
}

export default WidgetDuplicates
