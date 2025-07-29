import { find, get, isEmpty, map, orderBy, remove, set, uniqBy } from 'lodash'

import Document from '@/api/resources/Document'
import NamedEntity from '@/api/resources/NamedEntity'

const _raw = '_RAW'
const _parents = '_PARENTS'
const _roots = '_ROOTS'
const _from = '_FROM'

export default class EsDocList {
  constructor(raw, parents = null, roots = null, from = 0) {
    this[_raw] = isEmpty(raw) ? EsDocList.emptyRaw : raw
    this[_parents] = isEmpty(parents) ? EsDocList.emptyRaw : parents
    this[_roots] = isEmpty(roots) ? EsDocList.emptyRaw : roots
    this[_from] = isNaN(from) ? null : from
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
      uniqBy(this.get('hits.hits', []), d => d._id)
    )
  }

  append(raw) {
    const response = new EsDocList(raw)
    response.hits.forEach(hit => this.push('hits.hits', hit))
  }

  findParent(id) {
    return find(this[_parents].hits.hits, ({ _id }) => _id === id)
  }

  findRoot(id) {
    return find(this[_roots].hits.hits, ({ _id }) => _id === id)
  }

  get from() {
    return this[_from]
  }

  get hits() {
    return map(this.get('hits.hits', []), (hit, i) => {
      const parent = this.findParent(hit._source.parentDocument)
      const root = this.findRoot(hit._source.rootDocument)
      const position = this.from + i
      return EsDocList.instantiate(hit, parent, root, position)
    })
  }

  get aggregations() {
    return this[_raw].aggregations || {}
  }

  get total() {
    return this[_raw].hits.total.value
  }

  static instantiate(hit, parent = null, root = null, position = 0) {
    const Type = find(EsDocList.types, Type => Type.match(hit))
    return new Type(hit, parent, root, position)
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
