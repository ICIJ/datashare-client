import map from 'lodash/map'
import find from 'lodash/find'

import Document from './Document'
import NamedEntity from './NamedEntity'

const _raw = Symbol('raw')

export default class Response {
  constructor (raw) {
    this[_raw] = raw
  }
  instantiate (hit) {
    const Type = find(this.types, Type => Type.match(hit))
    return new Type(hit)
  }
  get hits () {
    return map(this[_raw].hits.hits, hit => {
      return this.instantiate(hit)
    })
  }
  get types () {
    return [Document, NamedEntity]
  }
}
