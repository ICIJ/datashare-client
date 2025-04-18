import { map, toLower } from 'lodash'

import FilterText from './FilterText'

import DisplayContentType from '@/components/Display/DisplayContentType'
import types from '@/utils/contentTypes.json'
import { getDocumentTypeLabel } from '@/utils/utils'

export default class FilterContentType extends FilterText {
  constructor(options) {
    const alternativeSearch = (query) => {
      return map(types, (item, key) => {
        if (toLower(item.label).includes(query)) {
          return key
        }
      })
    }
    super({ alternativeSearch, ...options })
  }
  itemLabel(item) {
    return getDocumentTypeLabel(item.key)
  }

  static get display() {
    return DisplayContentType
  }
}
