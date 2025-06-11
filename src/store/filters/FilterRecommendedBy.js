import FilterText from './FilterText'

import DisplayRecommendedBy from '@/components/Display/DisplayRecommendedBy'
import { useRecommendedStore } from '@/store/modules/recommended'

export default class FilterRecommendedBy extends FilterText {
  constructor(options) {
    super(options)
    this.component = 'FilterTypeRecommendedBy'
  }

  addChildIncludeFilter(body) {
    return body.addFilter('terms', this.key, useRecommendedStore().documents)
  }

  addChildExcludeFilter(body) {
    return body.notFilter('terms', this.key, useRecommendedStore().documents)
  }

  applyTo(body) {
    return super.applyTo(body)
  }

  static get display() {
    return DisplayRecommendedBy
  }
}
