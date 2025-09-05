import includes from 'lodash/includes'

import FilterType from './FilterType'

import { ENTITY_CATEGORY } from '@/enums/entityCategories'

export const namedEntityCategoryTranslation = {
  namedEntityPerson: ENTITY_CATEGORY.PERSON,
  namedEntityOrganization: ENTITY_CATEGORY.ORGANIZATION,
  namedEntityLocation: ENTITY_CATEGORY.LOCATION,
  namedEntityEmail: ENTITY_CATEGORY.EMAIL
}

export default class FilterEntity extends FilterType {
  constructor(options) {
    super(options)
    this.category = (options.category || ENTITY_CATEGORY.PERSON).toUpperCase()
    this.component = 'FilterType'
    this.sortByOptions = [
      { sortBy: '_count', orderBy: 'asc' },
      { sortBy: '_count', orderBy: 'desc' },
      { sortBy: '_key', orderBy: 'asc' },
      { sortBy: '_key', orderBy: 'desc' }
    ]
  }

  isSelfAffected(body) {
    return includes(
      JSON.stringify(body.build()),
      '"term":{"category":"' + namedEntityCategoryTranslation[this.name] + '"}'
    )
  }

  queryBuilder(body, param, func) {
    return body[func]('bool', (b) => {
      b.orQuery('has_child', 'type', 'NamedEntity', {}, (sub) => {
        return sub
          .query('query_string', {
            default_field: 'mentionNorm',
            query: param.values.map(v => `(${v})`).join(' OR ')
          })
          .query('query_string', {
            default_field: 'category',
            query: (namedEntityCategoryTranslation[param.name] || param.name).toUpperCase()
          })
      })

      b.orQuery('query_string', {
        default_field: 'mentionNorm',
        query: param.values.map(v => `(${v})`).join(' OR ')
      })
      return b
    })
  }

  addChildIncludeFilter(body, param) {
    return this.queryBuilder(body, param, 'query')
  }

  addParentIncludeFilter(body, param) {
    if (this.isSelfAffected(body)) {
      return body.query('terms', 'mentionNorm', param.values)
    }

    return body.query('has_parent', { parent_type: 'Document' }, (q) => {
      return q.query('has_child', 'type', 'NamedEntity', {}, (r) => {
        return r.query('terms', 'mentionNorm', param.values)
      })
    })
  }

  addParentExcludeFilter(body, param) {
    return body.query('has_parent', { parent_type: 'Document' }, (q) => {
      return q.notQuery('has_child', 'type', 'NamedEntity', {}, (r) => {
        return r.query('terms', 'mentionNorm', param.values)
      })
    })
  }

  body(body, options, from = 0, size = 50) {
    return body
      .query('term', 'type', 'NamedEntity')
      .filter('term', 'isHidden', 'false')
      .filter('term', 'category', this.category)
      .agg('terms', 'mentionNorm', this.key, { ...options }, (sub) => {
        return sub.agg('bucket_sort', { size, from }, 'bucket_truncate')
      })
  }
}
