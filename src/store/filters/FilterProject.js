import FilterText from './FilterText'

import DisplayProject from '@/components/Display/DisplayProject'

/**
 * Filter on the Elasticsearch `_index` so the user can restrict a search
 * to one or more Datashare projects.
 */
export default class FilterProject extends FilterText {
  constructor(options) {
    super(options)
    this.component = 'FilterTypeProject'
  }

  /** @returns {object} Display component used to render selected values. */
  static get display() {
    return DisplayProject
  }
}
