import find from 'lodash/find'
import get from 'lodash/get'
import map from 'lodash/map'

import Document from './Document'
import NamedEntity from './NamedEntity'

const _raw = Symbol('raw')

export default class Response {
  constructor (raw) {
    this[_raw] = raw
  }
  get (path, defaultValue) {
    return get(this, path, defaultValue)
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
  static none () {
    return new Response({hits: {hits: []}})
  }
  static get types () {
    return [Document, NamedEntity]
  }
}
