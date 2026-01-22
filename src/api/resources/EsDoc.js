import { cloneDeep, get, matches, set } from 'lodash'

const _raw = '_RAW'

export default class EsDoc {
  constructor(raw = {}) {
    this[_raw] = cloneDeep(raw)
  }

  get(path, defaultValue) {
    return get(this.raw, path, defaultValue)
  }

  set(path, value) {
    return set(this.raw, path, value)
  }

  get id() {
    return this.raw._id
  }

  get index() {
    return this.raw._index
  }

  get routing() {
    return this.raw._routing || this.id
  }

  get version() {
    return this.raw._version
  }

  get type() {
    return this.raw._source.type
  }

  get eq() {
    return matches({ id: this.id, index: this.index })
  }

  get source() {
    return this.get('_source', {})
  }

  get raw() {
    return this[_raw]
  }

  get serializedForStorage() {
    return this.raw
  }

  get project() {
    return this.get('_index')
  }

  static match(hit) {
    const raw = hit.raw || hit
    return get(raw, '_source.type', 'Document') === (this.esName || this.name)
  }

  static create(raw, parent) {
    return new EsDoc(raw, parent)
  }
}
