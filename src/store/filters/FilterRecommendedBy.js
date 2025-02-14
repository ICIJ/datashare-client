import FilterText from './FilterText'

import DisplayUser from '@/components/Display/DisplayUser'

export default class FilterRecommendedBy extends FilterText {
  constructor(options) {
    super(options)
    this.component = 'FilterTypeRecommendedBy'
  }

  addChildIncludeFilter(body) {
    return body.addFilter('terms', this.key, this.rootState.recommended.documents)
  }

  addChildExcludeFilter(body) {
    return body.notFilter('terms', this.key, this.rootState.recommended.documents)
  }

  applyTo(body) {
    return super.applyTo(body)
  }

  static get display() {
    return {
      extends: DisplayUser,
      props: {
        hideAvatar: {
          default: true
        }
      }
    }
  }
}
