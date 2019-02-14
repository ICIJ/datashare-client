import last from 'lodash/last'
import get from 'lodash/get'
import EsDoc from './EsDoc'
import moment from 'moment'

export default class Document extends EsDoc {
  get path () {
    return get(this, 'source.path', '')
  }
  get basename () {
    return last(this.path.split('/'))
  }
  get highlight () {
    return this.raw.highlight
  }
  get url () {
    return '/api/index/src/' + this.index + '/' + this.id + '?routing=' + this.routing
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
  static get esName () {
    return 'Document'
  }
}
