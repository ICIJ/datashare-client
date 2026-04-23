import includes from 'lodash/includes'

import FilterType from './FilterType'

import { ENTITY_CATEGORY } from '@/enums/entityCategories'

export const namedEntityCategoryTranslation = {
  namedEntityPerson: ENTITY_CATEGORY.PERSON,
  namedEntityOrganization: ENTITY_CATEGORY.ORGANIZATION,
  namedEntityLocation: ENTITY_CATEGORY.LOCATION,
  namedEntityEmail: ENTITY_CATEGORY.EMAIL
}

/**
 * Filter over `NamedEntity` child documents. Matches on `mentionNorm`
 * scoped to a required entity `category` (person, organization, location,
 * email).
 */
export default class FilterEntity extends FilterType {
  /**
   * @param {object} options - See `FilterText` for base options.
   * @param {string} options.category - Required entity category (case-insensitive).
   * @throws {Error} If `options.category` is missing.
   */
  constructor(options) {
    super(options)
    if (!options.category) {
      throw new Error('FilterEntity requires a category')
    }
    this.category = options.category.toUpperCase()
    this.component = 'FilterType'
    this.sortByOptions = [
      { sortBy: '_count', orderBy: 'asc' },
      { sortBy: '_count', orderBy: 'desc' },
      { sortBy: '_key', orderBy: 'asc' },
      { sortBy: '_key', orderBy: 'desc' }
    ]
  }

  /**
   * @param {object} body - Bodybuilder instance.
   * @returns {boolean} `true` when the body already targets this filter's category.
   */
  isSelfAffected(body) {
    return includes(
      JSON.stringify(body.build()),
      '"term":{"category":"' + namedEntityCategoryTranslation[this.name] + '"}'
    )
  }

  /**
   * Build a bool-query that matches on `mentionNorm` scoped to the entity category.
   * @param {object} body - Bodybuilder instance.
   * @param {{name: string, values: string[]}} param - Current selection.
   * @param {string} func - Bodybuilder chain method (e.g. `query`, `notQuery`).
   * @returns {object} The mutated body.
   */
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

  /**
   * Include matching entities when running directly against NamedEntity docs.
   * @param {object} body - Bodybuilder instance.
   * @param {{name: string, values: string[]}} param - Current selection.
   * @returns {object} The mutated body.
   */
  addChildIncludeFilter(body, param) {
    return this.queryBuilder(body, param, 'query')
  }

  /**
   * Include documents that have at least one matching NamedEntity child.
   * Collapses to a direct `terms` query when the body already targets this category.
   * @param {object} body - Bodybuilder instance.
   * @param {{values: string[]}} param - Current selection.
   * @returns {object} The mutated body.
   */
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

  /**
   * Exclude documents that have any matching NamedEntity child.
   * @param {object} body - Bodybuilder instance.
   * @param {{values: string[]}} param - Current selection.
   * @returns {object} The mutated body.
   */
  addParentExcludeFilter(body, param) {
    return body.query('has_parent', { parent_type: 'Document' }, (q) => {
      return q.notQuery('has_child', 'type', 'NamedEntity', {}, (r) => {
        return r.query('terms', 'mentionNorm', param.values)
      })
    })
  }

  /**
   * Attach a `terms` aggregation over `mentionNorm` scoped to this category.
   * @param {object} body - Bodybuilder instance.
   * @param {object} [options] - Extra aggregation options.
   * @param {number} [from=0] - Pagination offset.
   * @param {number} [size=50] - Number of buckets returned.
   * @returns {object} The mutated body.
   */
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
