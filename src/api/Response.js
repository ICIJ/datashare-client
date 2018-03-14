import map from 'lodash/map'
import find from 'lodash/find'

import Document from './Document'
import NamedEntity from './NamedEntity'

const _raw = Symbol('raw')

export default class Response {
  constructor (raw) {
    this[_raw] = raw
  }
  get hits () {
    return map(this[_raw].hits.hits, hit => {
      return Response.instantiate(hit)
    })
  }
  get aggregations () {
    return this[_raw].aggregations || {}
  }
  static instantiate (hit) {
    const Type = find(Response.types, Type => Type.match(hit))
    return new Type(hit)
  }
  static get types () {
    return [Document, NamedEntity]
  }
}
