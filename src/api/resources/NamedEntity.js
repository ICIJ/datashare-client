import { get } from 'lodash'
import EsDoc from './EsDoc'

export default class NamedEntity extends EsDoc {
  get category() {
    return this.source.category.toLowerCase()
  }
  get offsets() {
    /**
     * This ensures retro compatibility with Named Entities extracted
     * prior to 9.15.0 with a single offset.
     *
     * @deprecated
     */
    if (this.source.offset > -1) {
      return [this.source.offset]
    }
    return get(this, 'source.offsets', [])
  }
  get length() {
    return this.source.mention.length
  }
  get mention() {
    return this.source.mention
  }
  static get esName() {
    return 'NamedEntity'
  }
}
