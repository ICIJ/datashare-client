import FilterText from './FilterText'

import DisplayRecommendedBy from '@/components/Display/DisplayRecommendedBy'
import { useRecommendedStore } from '@/store/modules/recommended'

/**
 * Filter restricting results to documents recommended by a set of users.
 * Pulls the recommended document ids from the recommended store at query time.
 */
export default class FilterRecommendedBy extends FilterText {
  constructor(options) {
    super(options)
    this.component = 'FilterTypeRecommendedBy'
  }

  /**
   * Keep only documents whose id is in the recommended store.
   * @param {object} body - Bodybuilder instance.
   * @returns {object} The mutated body.
   */
  addChildIncludeFilter(body) {
    return body.addFilter('terms', this.key, useRecommendedStore().documents)
  }

  /**
   * Drop documents whose id is in the recommended store.
   * @param {object} body - Bodybuilder instance.
   * @returns {object} The mutated body.
   */
  addChildExcludeFilter(body) {
    return body.notFilter('terms', this.key, useRecommendedStore().documents)
  }

  /**
   * Apply this filter through the base class pipeline.
   * @param {object} body - Bodybuilder instance.
   * @returns {object|null} The mutated body.
   */
  applyTo(body) {
    return super.applyTo(body)
  }

  /** @returns {object} Display component used to render selected values. */
  static get display() {
    return DisplayRecommendedBy
  }
}
