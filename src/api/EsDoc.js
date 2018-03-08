import extend from 'lodash/extend'

const _raw = Symbol('raw')

export default class EsDoc {
  constructor (raw) {
    this[_raw] = raw
    this.map(raw)
  }
  map (raw) {
    // Map the given object to document attribute
    return extend(this, {
      id: raw._id,
      version: raw._version,
      type: raw._type,
      source: raw._source
    })
  }
  get raw () {
    return this[_raw]
  }
  static match (hit) {
    return hit._source.type === this.name
  }
}
