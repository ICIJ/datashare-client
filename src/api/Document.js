import last from 'lodash/last'
import EsDoc from './EsDoc'

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
}
