import compact from 'lodash/compact'
import includes from 'lodash/includes'
import some from 'lodash/some'

// Private properties keys
const _VALUES = typeof Symbol === 'function' ? Symbol('_values') : '_values'
const _STORE = typeof Symbol === 'function' ? Symbol('_store') : '_store'

/**
 * Base filter class. Builds an Elasticsearch `terms` aggregation over a
 * keyword field and translates selected values into include/exclude queries.
 * Subclasses customize the aggregation shape, key/label mapping, or how
 * filter values are turned into Elasticsearch queries.
 */
export default class FilterText {
  /**
   * @param {object} [options]
   * @param {string} options.name - Unique filter name (route query key, i18n key).
   * @param {string} options.key - Elasticsearch field (or `_index` / `_id`) aggregated on.
   * @param {object} [options.icon] - Icon component rendered next to the filter title.
   * @param {boolean} [options.hideAll=false] - Hide the "all" toggle in the UI.
   * @param {boolean} [options.hideContextualize=false] - Hide the "contextualize" toggle.
   * @param {boolean} [options.hideExclude=false] - Hide the "exclude" toggle.
   * @param {boolean} [options.hideExpand=false] - Hide the "expand in modal" action.
   * @param {boolean} [options.hideSearch=false] - Hide the search-within-filter field.
   * @param {boolean} [options.hideSort=false] - Hide the sort dropdown.
   * @param {number} [options.order=null] - Display order in the filter panel.
   * @param {string} [options.section=null] - Panel section this filter belongs to.
   * @param {boolean} [options.fromElasticSearch=true] - Whether buckets come from an ES aggregation.
   * @param {string} [options.preference='_local'] - Preference key for persisted UI state.
   * @param {boolean} [options.forceExclude=false] - Force an exclusive match even when the UI toggle is off.
   * @param {string[]} [options.modes=null] - Restrict this filter to specific Datashare modes.
   * @param {number|null} [options.pagelessBucketSize=null] - When set, fetch this many buckets in one
   *   aggregation request and disable infinite scroll. When `null`, paginate with the default size.
   * @param {boolean} [options.hidden=false] - Hide the filter from the filters panel entirely.
   *   The filter still participates in URL/breadcrumb sync and can be set programmatically.
   */
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
    order = null,
    section = null,
    fromElasticSearch = true,
    preference = '_local',
    forceExclude = false,
    modes = null,
    pagelessBucketSize = null,
    hidden = false
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
    this.order = order
    this.section = section
    this.fromElasticSearch = fromElasticSearch
    this.preference = preference
    this.forceExclude = forceExclude
    this.modes = modes
    this.pagelessBucketSize = pagelessBucketSize
    this.hidden = hidden
  }

  /**
   * Build the search-state param stored for a selected bucket.
   * @param {object} item - Bucket or item produced by the UI.
   * @param {string} item.key - Bucket key (raw Elasticsearch term).
   * @returns {{name: string, value: string}} Param recorded in the search store.
   */
  itemParam({ key }) {
    return { name: this.name, value: key }
  }

  /**
   * Extra bucket-key tokens matched against when the user searches within the
   * filter. Override in subclasses that want label-based matching.
   * @returns {string[]} List of regex-escaped token candidates.
   */
  keyAliases() {
    return []
  }

  /**
   * Resolve the translation key used to display a bucket label.
   * @param {object} [item] - Bucket-like shape.
   * @param {string} [item.key] - Bucket key.
   * @param {string} [item.value] - Alternative value when used from a param.
   * @returns {string|null} The label identifier (i18n key or raw value).
   */
  itemLabel({ key = null, value = null } = {}) {
    return key || value
  }

  /**
   * Restrict the query to documents whose field contains any of the selected values.
   * @param {object} body - Bodybuilder instance being mutated.
   * @param {{values: string[]}} param - Current selection.
   * @returns {object} The mutated body (chainable).
   */
  addChildIncludeFilter(body, param) {
    return body.addFilter('terms', this.key, param.values)
  }

  /**
   * Same as `addChildIncludeFilter` but wrapped in `has_parent` so it resolves
   * against parent `Document` records from a child aggregation.
   * @param {object} body - Bodybuilder instance being mutated.
   * @param {{values: string[]}} param - Current selection.
   * @returns {object} The mutated body.
   */
  addParentIncludeFilter(body, param) {
    return body.query('has_parent', { parent_type: 'Document' }, q => q.query('terms', this.key, param.values))
  }

  /**
   * Same as `addParentIncludeFilter` but negated.
   * @param {object} body - Bodybuilder instance being mutated.
   * @param {{values: string[]}} param - Current selection.
   * @returns {object} The mutated body.
   */
  addParentExcludeFilter(body, param) {
    return body.query('has_parent', { parent_type: 'Document' }, q => q.notQuery('terms', this.key, param.values))
  }

  /**
   * Same as `addChildIncludeFilter` but negated.
   * @param {object} body - Bodybuilder instance being mutated.
   * @param {{values: string[]}} param - Current selection.
   * @returns {object} The mutated body.
   */
  addChildExcludeFilter(body, param) {
    return body.notFilter('terms', this.key, param.values)
  }

  /**
   * Attach this filter's `terms` aggregation to the query body.
   * @param {object} body - Bodybuilder instance.
   * @param {object} [options] - Extra aggregation options (e.g. `include`, `order`).
   * @param {number} [from=0] - Pagination offset.
   * @param {number} [size=8] - Number of buckets to return.
   * @returns {object} The mutated body.
   */
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

  /**
   * Dispatch to the right include/exclude variant based on the shape of the body.
   * No-op when no value is selected.
   * @param {object} body - Bodybuilder instance.
   * @returns {object|null} The mutated body, or `null` if no matching method exists.
   */
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

  /**
   * @returns {boolean} `true` when at least one value is currently selected.
   */
  hasValues() {
    return this.values.length > 0
  }

  /**
   * Detect a NamedEntity aggregation so filters know to wrap in `has_parent`.
   * @param {object} body - Bodybuilder instance.
   * @returns {boolean} `true` when the body already targets `type: NamedEntity`.
   */
  isNamedEntityAggregation(body) {
    return some(['"must":{"term":{"type":"NamedEntity"}}', '"must":[{"term":{"type":"NamedEntity"}}'], str =>
      includes(JSON.stringify(body.build()), str)
    )
  }

  /**
   * Apply this filter to a query body. Override when a filter needs custom placement.
   * @param {object} body - Bodybuilder instance.
   * @returns {object|null} The mutated body.
   */
  applyTo(body) {
    return this.addFilter(body)
  }

  /**
   * Bind the filter to a search store so it can read values and sort state.
   * @param {object} store - Slice of the search store.
   * @param {object} store.values - Map of filter name to selected values.
   * @param {string[]} store.excludeFilters - Names of excluded filters.
   * @param {string[]} store.contextualizeFilters - Names of contextualized filters.
   * @param {object} store.sortFilters - Map of filter name to `{ sortBy, orderBy }`.
   * @returns {this} `this`, chainable.
   */
  bindStore({ values, excludeFilters, contextualizeFilters, sortFilters }) {
    this[_STORE] = { values, excludeFilters, contextualizeFilters, sortFilters }
    return this
  }

  /**
   * @returns {object|null} The bound search store, or `null` if not bound yet.
   */
  get store() {
    return this[_STORE] ?? null
  }

  /**
   * Currently selected values. Prefers a local override set via the setter;
   * falls back to the bound store.
   * @returns {string[]} Non-empty selected values.
   */
  get values() {
    return compact(this[_VALUES] || this.store.values[this.name] || [])
  }

  /**
   * Override the selected values locally without going through the store.
   * @param {string[]} values - New local values.
   */
  set values(values) {
    this[_VALUES] = values
  }

  /**
   * Chainable alternative to the `values` setter.
   * @param {string[]} values - New local values.
   * @returns {this} `this`, chainable.
   */
  setValues(values) {
    this.values = values
    return this
  }

  /**
   * @returns {boolean} `true` when this filter is configured as an exclusion.
   */
  get excluded() {
    return this.store?.excludeFilters.indexOf(this.name) > -1
  }

  /**
   * @returns {boolean} `true` when this filter's aggregation is contextualized
   *   by the other active filters.
   */
  get contextualized() {
    return this.store?.contextualizeFilters.indexOf(this.name) > -1
  }

  /**
   * @returns {{sortBy: string, orderBy: string}|undefined} Current sort or undefined.
   */
  get sort() {
    return this.store?.sortFilters[this.name]
  }

  /**
   * @returns {string} Bucket sort field (defaults to `_count`).
   */
  get sortBy() {
    return this.sort?.sortBy ?? '_count'
  }

  /**
   * @returns {string} Bucket sort direction, `asc` or `desc` (defaults to `desc`).
   */
  get orderBy() {
    return this.sort?.orderBy ?? 'desc'
  }
}
