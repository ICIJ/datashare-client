import Murmur from '@icij/murmur'
import includes from 'lodash/includes'
import some from 'lodash/some'

const starredLabel = {
  all: 'facet.all',
  true: 'facet.starred',
  false: 'facet.not_starred'
}

const namedEntityCategoryTranslation = {
  'named-entity-person': 'PERSON',
  'named-entity-organization': 'ORGANIZATION',
  'named-entity-location': 'LOCATION'
}

class FacetText {
  constructor (name, key, isSearchable, labelFun) {
    this.name = name
    this.key = key
    this.isSearchable = isSearchable
    this.itemLabel = labelFun
    this.reverse = false
    this.values = []
    this.component = 'FacetText'
  }

  itemParam (item) {
    return { name: this.name, value: item.key }
  }

  addChildIncludeFilter (body, param) {
    return body.addFilter('terms', this.key, param.values)
  }

  addParentIncludeFilter (body, param) {
    return body.query('has_parent', { 'parent_type': 'Document' }, q => q.query('terms', this.key, param.values))
  }

  addParentExcludeFilter (body, param) {
    return body.query('has_parent', { 'parent_type': 'Document' }, q => q.notQuery('terms', this.key, param.values))
  }

  addChildExcludeFilter (body, param) {
    return body.notFilter('terms', this.key, param.values)
  }

  body (body, options) {
    return body.agg('terms', this.key, this.key, options)
  }

  addFilter (body) {
    if (this.hasValues()) {
      if (this.reverse) {
        if (this.isNamedEntityAggregation(body)) {
          return this.addParentExcludeFilter(body, { name: this.name, values: this.values, reverse: this.reverse })
        } else {
          return this.addChildExcludeFilter(body, { name: this.name, values: this.values, reverse: this.reverse })
        }
      } else {
        if (this.isNamedEntityAggregation(body)) {
          return this.addParentIncludeFilter(body, { name: this.name, values: this.values, reverse: this.reverse })
        } else {
          return this.addChildIncludeFilter(body, { name: this.name, values: this.values, reverse: this.reverse })
        }
      }
    }
  }

  hasValues () {
    return this.values.length > 0
  }

  isNamedEntityAggregation (body) {
    return some(['"must":{"term":{"type":"NamedEntity"}}', '"must":[{"term":{"type":"NamedEntity"}}'], str => includes(JSON.stringify(body.build()), str))
  }

  applyTo (body) {
    this.addFilter(body)
  }
}

class FacetYesNo extends FacetText {
  constructor (name, key, isSearchable, labelFun) {
    super(name, key, isSearchable, labelFun)
    this.component = 'FacetYesNo'
    this.starredDocuments = []
  }

  addChildIncludeFilter (body, param) {
    if (param.values[0]) {
      return body.addFilter('terms', this.key, this.starredDocuments)
    } else {
      return body.notFilter('terms', this.key, this.starredDocuments)
    }
  }

  body (body, options) {
    return body.query('match', 'type', 'Document').agg('terms', this.key, this.key, options)
  }
}

class FacetType extends FacetText {
  constructor (name, key, isSearchable, labelFun) {
    super(name, key, isSearchable, labelFun)
    this.component = 'FacetType'
  }

  addChildIncludeFilter (body, param, func) {
    return this.queryBuilder(body, param, 'orQuery')
  }

  addChildExcludeFilter (body, param, func) {
    return this.queryBuilder(body, param, 'notQuery')
  }
}

class FacetDocument extends FacetType {
  constructor (name, key, isSearchable, labelFun) {
    super(name, key, isSearchable, labelFun)
    this.component = 'FacetDocument'
  }

  addParentIncludeFilter (body, param) {
    return body.query('has_parent', { 'parent_type': 'Document' }, q => this.addChildIncludeFilter(q, param))
  }
}

class FacetDate extends FacetDocument {
  constructor (name, key, isSearchable, labelFun) {
    super(name, key, isSearchable, labelFun)
    this.component = 'FacetDate'
  }

  queryBuilder (body, param, func) {
    return body.query('bool', sub => {
      param.values.forEach(date => {
        if (parseInt(date) === -62167219200000) {
          sub['notQuery']('exists', this.key)
        } else {
          const gte = new Date(parseInt(date))
          const tmp = new Date(parseInt(date))
          const lte = new Date(tmp.setMonth(tmp.getMonth() + 1) - 1)
          sub[func]('range', this.key, { gte, lte })
        }
      })
      return sub
    })
  }

  body (body, options) {
    return body
      .query('match', 'type', 'Document')
      .agg('date_histogram', this.key, {
        interval: '1M',
        format: 'yyyy-MM',
        order: { '_key': 'desc' },
        min_doc_count: 1,
        missing: '0000-01'
      }, this.key, a => a.agg('bucket_sort', { size: options.size }, 'bucket_sort_truncate'))
  }
}

class FacetPath extends FacetDocument {
  constructor (name, key, isSearchable) {
    super(name, key, isSearchable, null)
    this.prefix = true
    this.component = 'FacetPath'
  }

  queryBuilder (body, param, func) {
    return body.query('bool', sub => {
      param.values.forEach(dirname => sub[func]('prefix', { dirname }))
      return sub
    })
  }

  body (body, options) {
    return body.agg('terms', 'dirname.tree', this.key, {
      size: 1000,
      order: { '_key': 'asc' },
      exclude: Murmur.config.get('dataDir') + '/.*/.*',
      include: Murmur.config.get('dataDir') + '/.*',
      ...options
    })
  }
}

class FacetNamedEntity extends FacetType {
  constructor (name, key, isSearchable, category = 'PERSON') {
    super(name, key, isSearchable, null)
    this.category = category
    this.component = 'FacetNamedEntity'
  }

  isSelfAffected (body) {
    return includes(JSON.stringify(body.build()), '"term":{"category":"' + namedEntityCategoryTranslation[this.name] + '"}')
  }

  queryBuilder (body, param, func) {
    return body[func]('bool', b => {
      b.orQuery('has_child', 'type', 'NamedEntity', {}, sub => {
        return sub.query('query_string', {
          default_field: 'mentionNorm',
          query: param.values.map(v => `(${v})`).join(' OR ')
        }).query('query_string', {
          default_field: 'category',
          query: namedEntityCategoryTranslation[param.name]
        })
      })

      b.orQuery('query_string', {
        default_field: 'mentionNorm',
        query: param.values.map(v => `(${v})`).join(' OR ')
      })
      return b
    })
  }

  addChildIncludeFilter (body, param) {
    return this.queryBuilder(body, param, 'query')
  }

  addParentIncludeFilter (body, param) {
    if (this.isSelfAffected(body)) {
      return body.query('terms', 'mentionNorm', param.values)
    } else {
      return body.query('has_parent', { 'parent_type': 'Document' }, q => q.query('has_child', 'type', 'NamedEntity', {}, r => r.query('terms', 'mentionNorm', param.values)))
    }
  }

  addParentExcludeFilter (body, param) {
    return body.query('has_parent', { 'parent_type': 'Document' }, q => q.notQuery('has_child', 'type', 'NamedEntity', {}, r => r.query('terms', 'mentionNorm', param.values)))
  }

  body (body, options) {
    return body
      .query('term', 'type', 'NamedEntity')
      .filter('term', 'isHidden', 'false')
      .filter('term', 'category', this.category)
      .agg('terms', 'mentionNorm', this.key, {
        size: 50,
        order: [ { 'byDocs': 'desc' }, { '_count': 'desc' } ],
        ...options
      }, sub => {
        return sub
          .agg('cardinality', 'join#Document', 'byDocs')
          .agg('terms', 'category', 'byCategories', sub => {
            return sub.agg('cardinality', 'join#Document', 'byDocs')
          })
      })
  }
}

export { FacetText, FacetYesNo, FacetDate, FacetPath, FacetNamedEntity, namedEntityCategoryTranslation, starredLabel }
