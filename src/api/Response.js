import find from 'lodash/find'
import get from 'lodash/get'
import map from 'lodash/map'
import remove from 'lodash/remove'
import set from 'lodash/set'

import Document from './Document'
import NamedEntity from './NamedEntity'

const _raw = Symbol('raw')

export default class Response {
  constructor (raw) {
    this[_raw] = raw
  }
  get (path, defaultValue) {
    return get(this[_raw], path, defaultValue)
  }
  set (path, value) {
    return set(this[_raw], path, value)
  }
  push (path, value) {
    const arr = this.get(path, [])
    arr.push(value)
    return this.set(path, arr)
  }
  prepend (path, value) {
    const arr = this.get(path, [])
    remove(arr, value)
    return this.set(path, [value].concat(arr))
  }
  get hits () {
    return map(this.get('hits.hits', []), hit => {
      return Response.instantiate(hit)
    })
  }
  get aggregations () {
    return this[_raw].aggregations || {}
  }
  get total () {
    return this[_raw].hits.total
  }
  static instantiate (hit) {
    const Type = find(Response.types, Type => Type.match(hit))
    return new Type(hit)
  }
  static none () {
    return new Response({ hits: { hits: [], total: 0 } })
  }
  static get types () {
    return [Document, NamedEntity]
  }
}
