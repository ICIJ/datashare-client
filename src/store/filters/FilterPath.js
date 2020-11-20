import FilterDocument from './FilterDocument'

export default class FilterPath extends FilterDocument {
  constructor (options) {
    super(options)
    this.prefix = true
    this.component = 'FilterPath'
  }

  queryBuilder (body, param, func) {
    return body.query('bool', sub => {
      param.values.forEach(dirname => sub[func]('prefix', { path: dirname }))
      return sub
    })
  }
}
