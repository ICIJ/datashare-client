import last from 'lodash/last'
import pick from 'lodash/pick'
import Murmur from '@icij/murmur'

import DatashareClient from './DatashareClient'
import EsDoc from './EsDoc'
import moment from 'moment'

export default class Document extends EsDoc {
  get shortId () {
    return this.id.slice(0, 10)
  }
  get path () {
    return this.get('_source.path', '')
  }
  get folder () {
    // Extract location parts
    let parts = this.path.split('/')
    // Remove the file name
    parts.splice(-1, 1)
    // And return the new path
    return parts.join('/') + '/'
  }
  get location () {
    return this.folder.split(Murmur.config.get('dataDir', process.env.VUE_APP_DATA_PREFIX)).pop()
  }
  get basename () {
    return last(this.path.split('/'))
  }
  get slicedName () {
    if (this.get('_source.extractionLevel', 0) === 0) {
      return [ this.basename ]
    }
    const distance = this.get('_source.extractionLevel') - 1
    // Sliced name for extracted doc is composed of:
    // - root basename
    // - distance with the top parent
    // - shorter version of the document id
    return [ this.basename ].concat([ distance ].slice(0, distance)).concat([ this.shortId ])
  }
  get highlight () {
    return this.raw.highlight
  }
  get url () {
    return '/api/index/src/' + this.index + '/' + this.id + '?routing=' + this.routing
  }
  get fullUrl () {
    return DatashareClient.getFullUrl(this.url)
  }
  get contentType () {
    return this.source.contentType || 'unknown'
  }
  get creationDate () {
    return moment(this.source.metadata.tika_metadata_creation_date).format('LLL')
  }
  get humanSize () {
    if (this.source.contentLength === -1) return 'unknown'
    let size = this.source.contentLength
    let unitIndex = Math.floor(size === 0 ? 0 : Math.log(size) / Math.log(1024))
    let value = (size / Math.pow(1024, unitIndex)).toFixed(2)
    let unit = ['B', 'kB', 'MB', 'GB', 'TB'][unitIndex]
    return unitIndex === 0 ? `${size} B` : `${value} ${unit} (${size} B)`
  }
  get index () {
    return this.raw._index
  }
  get routerParams () {
    return pick(this, ['index', 'id', 'routing'])
  }
  get serializedForStorage () {
    return pick(this.raw, [
      '_id',
      '_routing',
      '_version',
      '_index',
      '_source.path',
      '_source.extractionLevel',
      '_source.contentLength'
    ])
  }
  static get esName () {
    return 'Document'
  }
  static create (raw) {
    return new Document(raw)
  }
}
