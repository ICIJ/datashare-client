import EsDoc from './EsDoc'

export default class NamedEntity extends EsDoc {
  get category () {
    return this.source.category.toLowerCase()
  }
  get index () {
    return this.source.offset
  }
  static get esName () {
    return 'NamedEntity'
  }
}
