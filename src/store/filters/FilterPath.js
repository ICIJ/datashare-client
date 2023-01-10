import compact from 'lodash/compact'
import trimEnd from 'lodash/trimEnd'
import uniq from 'lodash/uniq'
import FilterDocument from './FilterDocument'

export default class FilterPath extends FilterDocument {
  constructor(options) {
    super(options)
    this.prefix = true
    this.component = 'FilterPath'
  }

  queryBuilder(body, param, func) {
    return body.query('bool', (sub) => {
      compact(param.values).forEach((dirname) => {
        /**
         * @deprecated Since 9.4.2, the dirname field is tokenized using the
         * "lowercase" filter. To ensure retro-compatibility, we apply the
         * filter using both lowercase and orignal value for this field (if they
         * are different).
         */
        uniq([dirname, dirname.toLowerCase()]).forEach((token) => {
          sub[func]('term', 'dirname.tree', trimEnd(token, '/'))
        })
      })
      return sub
    })
  }
}
