import compact from 'lodash/compact'
import get from 'lodash/get'
import includes from 'lodash/includes'
import some from 'lodash/some'

// Private properties keys
const _VALUES = typeof Symbol === 'function' ? Symbol('_values') : '_values'
const _ROOT_STATE = typeof Symbol === 'function' ? Symbol('_ROOT_state') : '_ROOT_state'

export default class FilterText {
  constructor({
    name,
    key,
    icon = null,
    hideContextualize = false,
    hideExclude = false,
    hideExpand = false,
    hideSearch = false,
    hideSort = false,
    alternativeSearch = () => {},
    order = null,
    section = null,
    fromElasticSearch = true,
    preference = '_local',
    forceExclude = false
  } = {}) {
    this.name = name
    this.key = key
    this.icon = icon
    this.hideContextualize = hideContextualize
    this.hideExclude = hideExclude
    this.hideExpand = hideExpand
    this.hideSearch = hideSearch
    this.hideSort = hideSort
    this.component = 'FilterType'
    this.alternativeSearch = alternativeSearch
    this.order = order
    this.section = section
    this.fromElasticSearch = fromElasticSearch
    this.preference = preference
    this.forceExclude = forceExclude
  }

  itemParam(item) {
    return { name: this.name, value: item.key }
  }

  itemLabel(item) {
    return item.key || item.value
  }

  addChildIncludeFilter(body, param) {
    return body.addFilter('terms', this.key, param.values)
  }

  addParentIncludeFilter(body, param) {
    return body.query('has_parent', { parent_type: 'Document' }, (q) => q.query('terms', this.key, param.values))
  }

  addParentExcludeFilter(body, param) {
    return body.query('has_parent', { parent_type: 'Document' }, (q) => q.notQuery('terms', this.key, param.values))
  }

  addChildExcludeFilter(body, param) {
    return body.notFilter('terms', this.key, param.values)
  }

  body(body, options, from = 0, size = 8) {
    return body.query('match', 'type', 'Document').agg(
      'terms',
      this.key,
      this.key,
      (sub) => {
        return sub.agg(
          'bucket_sort',
          {
            size,
            from
          },
          'bucket_truncate'
        )
      },
      options
    )
  }

  addFilter(body) {
    if (this.hasValues()) {
      const filterType = this.isNamedEntityAggregation(body) ? 'Parent' : 'Child'
      const exclude = this.excluded || this.forceExclude
      const filterName = exclude ? 'Exclude' : 'Include'
      const options = { name: this.name, values: this.values, exclude }
      const method = `add${filterType}${filterName}Filter`
      return this[method] ? this[method](body, options) : null
    }
  }

  hasValues() {
    return this.values.length > 0
  }

  isNamedEntityAggregation(body) {
    return some(['"must":{"term":{"type":"NamedEntity"}}', '"must":[{"term":{"type":"NamedEntity"}}'], (str) =>
      includes(JSON.stringify(body.build()), str)
    )
  }

  applyTo(body) {
    return this.addFilter(body)
  }

  bindRootState(rootState) {
    this[_ROOT_STATE] = this[_ROOT_STATE] || rootState
  }

  get rootState() {
    return this[_ROOT_STATE]
  }

  get state() {
    return this?.rootState?.search
  }

  get values() {
    return compact(this[_VALUES] || get(this, ['state', 'values', this.name], []))
  }

  set values(values) {
    this[_VALUES] = values
  }

  setValues(values) {
    this.values = values
    return this
  }

  get excluded() {
    return get(this, ['state', 'excludeFilters'], []).indexOf(this.name) > -1
  }

  get contextualized() {
    return get(this, ['state', 'contextualizeFilters'], []).indexOf(this.name) > -1
  }

  get sortBy() {
    return get(this, ['state', 'sortFilters', this.name, 'sortBy'], '_count')
  }

  get orderBy() {
    return get(this, ['state', 'sortFilters', this.name, 'orderBy'], 'desc')
  }
}
