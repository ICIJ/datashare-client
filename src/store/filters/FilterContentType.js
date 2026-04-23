import { map, toLower } from 'lodash'

import FilterText from './FilterText'

import DisplayContentType from '@/components/Display/DisplayContentType'
import types from '@/utils/contentTypes.json'
import { getDocumentTypeLabel } from '@/utils/utils'

export default class FilterContentType extends FilterText {
  keyAliases(query) {
    return map(types, (item, key) => {
      if (toLower(item.label).includes(query)) {
        return key
      }
    })
  }

  itemLabel(item) {
    return getDocumentTypeLabel(item.key)
  }

  static get display() {
    return DisplayContentType
  }
}
