import FilterType from './FilterType'
import includes from 'lodash/includes'

export const namedEntityCategoryTranslation = {
  'namedEntityPerson': 'PERSON',
  'namedEntityOrganization': 'ORGANIZATION',
  'namedEntityLocation': 'LOCATION'
}

export default class FilterNamedEntity extends FilterType {
  constructor (name, key, icon, isSearchable, category = 'PERSON') {
    super(name, key, icon, isSearchable, null)
    this.category = category
    this.component = 'FilterNamedEntity'
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
