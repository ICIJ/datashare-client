import last from 'lodash/last'
import split from 'lodash/split'
import EsDoc from './EsDoc'
import moment from 'moment'

export default class Document extends EsDoc {
  get basename () {
    return last(this.source.path.split('/'))
  }
  get highlight () {
    return this.raw.highlight
  }
  get relativePath () {
    if (this.source.path.indexOf(process.env.CONFIG.data_prefix) === -1) {
      return this.source.path
    }
    return '/api' + process.env.CONFIG.data_prefix + split(this.source.path, process.env.CONFIG.data_prefix, 2)[1]
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
  static get esName () {
    return 'Document'
  }
}
