import { get } from 'lodash'

import EsDoc from './EsDoc'

export default class NamedEntity extends EsDoc {
  static esName = 'NamedEntity'

  /**
   * Creates a NamedEntity instance.
   * @param {Object} raw - The raw ES document data
   * @param {Object|null} [parent=null] - Parent document raw data (unused but passed by EsDocList)
   * @param {Object|null} [root=null] - Root document raw data (unused but passed by EsDocList)
   * @param {number} [position=0] - Position in search results (unused but passed by EsDocList)
   * @param {Object} [options={}] - Options passed to EsDoc
   */
  constructor(raw, parent = null, root = null, position = 0, options = {}) {
    super(raw, options)
  }

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

  get extractor() {
    return this.source.extractor
  }
}
