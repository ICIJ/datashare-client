import { cloneDeep, extend, get, set } from 'lodash'

const _raw = '_RAW'

export default class EsDoc {
  constructor (raw) {
    this[_raw] = cloneDeep(raw)
    this.map(raw)
  }
  map (raw) {
    // Map the given object to document attribute
    return extend(this, {
      id: raw._id,
      routing: raw._routing || raw._id,
      version: raw._version,
      type: raw._type
    })
  }
  get (path, defaultValue) {
    return get(this.raw, path, defaultValue)
  }
  set (path, value) {
    return set(this.raw, path, value)
  }
  get source () {
    return this.get('_source', {})
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
