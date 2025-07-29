import compact from 'lodash/compact'
import includes from 'lodash/includes'
import some from 'lodash/some'

// Private properties keys
const _VALUES = typeof Symbol === 'function' ? Symbol('_values') : '_values'
const _STORE = typeof Symbol === 'function' ? Symbol('_store') : '_store'

export default class FilterText {
  constructor({
    name,
    key,
    icon = null,
    hideAll = false,
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
    forceExclude = false,
    modes = null
  } = {}) {
    this.name = name
    this.key = key
    this.icon = icon
    this.hideAll = hideAll
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
    this.modes = modes
  }

  itemParam({ key }) {
    return { name: this.name, value: key }
  }

  itemLabel({ key = null, value = null } = {}) {
    return key || value
  }

  addChildIncludeFilter(body, param) {
    return body.addFilter('terms', this.key, param.values)
  }

  addParentIncludeFilter(body, param) {
    return body.query('has_parent', { parent_type: 'Document' }, q => q.query('terms', this.key, param.values))
  }

  addParentExcludeFilter(body, param) {
    return body.query('has_parent', { parent_type: 'Document' }, q => q.notQuery('terms', this.key, param.values))
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
    return some(['"must":{"term":{"type":"NamedEntity"}}', '"must":[{"term":{"type":"NamedEntity"}}'], str =>
      includes(JSON.stringify(body.build()), str)
    )
  }

  applyTo(body) {
    return this.addFilter(body)
  }

  bindStore({ values, excludeFilters, contextualizeFilters, sortFilters }) {
    this[_STORE] = { values, excludeFilters, contextualizeFilters, sortFilters }
    return this
  }

  get store() {
    return this[_STORE] ?? null
  }

  get values() {
    return compact(this[_VALUES] || this.store.values[this.name] || [])
  }

  set values(values) {
    this[_VALUES] = values
  }

  setValues(values) {
    this.values = values
    return this
  }

  get excluded() {
    return this.store?.excludeFilters.indexOf(this.name) > -1
  }

  get contextualized() {
    return this.store?.contextualizeFilters.indexOf(this.name) > -1
  }

  get sort() {
    return this.store?.sortFilters[this.name]
  }

  get sortBy() {
    return this.sort?.sortBy ?? '_count'
  }

  get orderBy() {
    return this.sort?.orderBy ?? 'desc'
  }
}
