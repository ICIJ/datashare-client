import FilterDocument from './FilterDocument'
import Murmur from '@icij/murmur'

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

  body (body, options) {
    // Remove the "size" property of "options" if any, to load all the folders
    delete options.size
    return body.agg('terms', 'dirname.tree', this.key, {
      order: { _key: 'asc' },
      exclude: Murmur.config.get('dataDir') + '/.*/.*',
      include: Murmur.config.get('dataDir') + '/.*',
      ...options
    })
  }
}
