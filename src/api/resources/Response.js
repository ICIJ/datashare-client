import Document from '@/api/resources/Document'
import NamedEntity from '@/api/resources/NamedEntity'
import isEmpty from 'lodash/isEmpty'
import find from 'lodash/find'
import get from 'lodash/get'
import map from 'lodash/map'
import remove from 'lodash/remove'
import set from 'lodash/set'
import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'

const _raw = '_RAW'

export default class Response {
  constructor (raw) {
    this[_raw] = isEmpty(raw) ? Response.emptyRaw : raw
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
  orderBy (iteratees, orders) {
    this.set('hits.hits', orderBy(this.get('hits.hits', []), iteratees, orders))
  }
  removeDuplicates () {
    this.set('hits.hits', uniqBy(this.get('hits.hits', []), d => d._id))
  }
  append (raw) {
    const response = new Response(raw)
    response.hits.forEach(hit => this.push('hits.hits', hit))
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
    return new Response(Response.emptyRaw)
  }
  static get emptyRaw () {
    return { hits: { hits: [], total: 0 } }
  }
  static get types () {
    return [Document, NamedEntity]
  }
}
