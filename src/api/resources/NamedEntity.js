import EsDoc from '../EsDoc'

export default class NamedEntity extends EsDoc {
  get category () {
    return this.source.category.toLowerCase()
  }
  get index () {
    return this.source.offset
  }
  get offset () {
    return this.source.offset
  }
  get length () {
    return this.source.mention.length
  }
  get mention () {
    return this.source.mention
  }
  static get esName () {
    return 'NamedEntity'
  }
}
