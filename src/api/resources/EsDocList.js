import { find, get, isEmpty, map, orderBy, remove, set, uniqBy } from 'lodash'

import Document from '@/api/resources/Document'
import NamedEntity from '@/api/resources/NamedEntity'

const _raw = '_RAW'
const _parentMap = '_PARENT_MAP'
const _rootMap = '_ROOT_MAP'
const _from = '_FROM'
const _hitsCache = '_HITS_CACHE'

/**
 * Builds a Map from an array of ES hits for O(1) lookups by _id.
 * @param {Object} raw - Raw ES response with hits.hits array
 * @returns {Map<string, Object>} Map of document ID to hit object
 */
function buildIdMap(raw) {
  const hits = get(raw, 'hits.hits', [])
  return new Map(hits.map((hit) => [hit._id, hit]))
}

export default class EsDocList {
  constructor(raw, parents = null, roots = null, from = 0) {
    this[_raw] = isEmpty(raw) ? EsDocList.emptyRaw : raw
    this[_parentMap] = buildIdMap(parents)
    this[_rootMap] = buildIdMap(roots)
    this[_from] = isNaN(from) ? null : from
    this[_hitsCache] = null
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
    this._invalidateCache()
  }

  removeDuplicates() {
    this.set(
      'hits.hits',
      uniqBy(this.get('hits.hits', []), (d) => d._id)
    )
    this._invalidateCache()
  }

  append(raw) {
    const response = new EsDocList(raw)
    response.hits.forEach((hit) => this.push('hits.hits', hit))
    this._invalidateCache()
  }

  /**
   * Finds a parent document by ID using O(1) Map lookup.
   * @param {string} id - The parent document ID
   * @returns {Object|undefined} The parent hit object
   */
  findParent(id) {
    return this[_parentMap].get(id)
  }

  /**
   * Finds a root document by ID using O(1) Map lookup.
   * @param {string} id - The root document ID
   * @returns {Object|undefined} The root hit object
   */
  findRoot(id) {
    return this[_rootMap].get(id)
  }

  /**
   * Invalidates the hits cache when underlying data changes.
   * @private
   */
  _invalidateCache() {
    this[_hitsCache] = null
  }

  get from() {
    return this[_from]
  }

  /**
   * Returns instantiated document hits with parent/root references.
   * Results are memoized to avoid re-transformation on every access.
   * @returns {Array<Document|NamedEntity>} Array of document instances
   */
  get hits() {
    if (this[_hitsCache] === null) {
      this[_hitsCache] = map(this.get('hits.hits', []), (hit, i) => {
        const parent = this.findParent(hit._source.parentDocument)
        const root = this.findRoot(hit._source.rootDocument)
        const position = this.from + i
        return EsDocList.instantiate(hit, parent, root, position)
      })
    }
    return this[_hitsCache]
  }

  get aggregations() {
    return this[_raw].aggregations || {}
  }

  get total() {
    return this[_raw].hits.total.value
  }

  static instantiate(hit, parent = null, root = null, position = 0) {
    const Type = find(EsDocList.types, t => t.match(hit))
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
