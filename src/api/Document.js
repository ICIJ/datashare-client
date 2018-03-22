import last from 'lodash/last'
import EsDoc from './EsDoc'
import moment from 'moment'

export default class Document extends EsDoc {
  get basename () {
    return last(this.source.path.split('/'))
  }
  get innerHits () {
    return this.raw.inner_hits
  }
  get highlight () {
    return this.raw.highlight
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
}
