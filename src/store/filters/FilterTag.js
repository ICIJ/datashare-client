import FilterText from './FilterText'

import DisplayTags from '@/components/Display/DisplayTags'

/**
 * Filter on document `tags`. Inherits the default terms-aggregation
 * behavior from `FilterText` and only overrides the display component.
 */
export default class FilterTag extends FilterText {
  /** @returns {object} Display component used to render selected values. */
  static get display() {
    return DisplayTags
  }
}
