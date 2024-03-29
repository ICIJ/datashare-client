import { find, get, isEmpty, map, orderBy, remove, set, uniqBy } from 'lodash'

import Document from '@/api/resources/Document'
import NamedEntity from '@/api/resources/NamedEntity'

const _raw = '_RAW'

export default class EsDocList {
  constructor(raw) {
    this[_raw] = isEmpty(raw) ? EsDocList.emptyRaw : raw
  }
  get(path, defaultValue) {
    return get(this[_raw], path, defaultValue)
  }
  set(path, value) {
    return set(this[_raw], path, value)
  }
  push(path, value) {
    const arr = this.get(path, [])
    arr.push(value)
    return this.set(path, arr)
  }
  prepend(path, value) {
    const arr = this.get(path, [])
    remove(arr, value)
    return this.set(path, [value].concat(arr))
  }
  orderBy(iteratees, orders) {
    this.set('hits.hits', orderBy(this.get('hits.hits', []), iteratees, orders))
  }
  removeDuplicates() {
    this.set(
      'hits.hits',
      uniqBy(this.get('hits.hits', []), (d) => d._id)
    )
  }
  append(raw) {
    const response = new EsDocList(raw)
    response.hits.forEach((hit) => this.push('hits.hits', hit))
  }
  get hits() {
    return map(this.get('hits.hits', []), (hit) => {
      return EsDocList.instantiate(hit)
    })
  }
  get aggregations() {
    return this[_raw].aggregations || {}
  }
  get total() {
    return this[_raw].hits.total.value
  }
  static instantiate(hit) {
    const Type = find(EsDocList.types, (Type) => Type.match(hit))
    return new Type(hit)
  }
  static none() {
    return new EsDocList(EsDocList.emptyRaw)
  }
  static get emptyRaw() {
    return { hits: { hits: [], total: { value: 0, relation: 'eq' } } }
  }
  static get types() {
    return [Document, NamedEntity]
  }
}
