import extend from 'lodash/extend'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'

import Response from './Response'

const _raw = Symbol('raw')
const _parent = Symbol('parent')

export default class EsDoc {
  constructor (raw, parent = null) {
    this[_raw] = cloneDeep(raw)
    this.setParent(parent)
    this.map(raw)
  }
  map (raw) {
    // Map the given object to document attribute
    return extend(this, {
      id: raw._id || raw._id,
      routing: raw._routing || raw._id,
      version: raw._version,
      type: raw._type,
      source: raw._source || {}
    })
  }
  get (path, defaultValue) {
    return get(this.raw, path, defaultValue)
  }
  setParent (parent) {
    this[_parent] = parent ? Response.instantiate(parent) : null
  }
  get parent () {
    return this[_parent]
  }
  get raw () {
    return this[_raw]
  }
  get serializedForStorage () {
    return this.raw
  }
  static match (hit) {
    const raw = hit.raw || hit
    return get(raw, '_source.type', 'Document') === (this.esName || this.name)
  }
  static create (raw, parent) {
    return new EsDoc(raw, parent)
  }
}
