import get from 'lodash/get'
import includes from 'lodash/includes'
import some from 'lodash/some'

// Private properties keys
const _VALUES = typeof Symbol === 'function' ? Symbol('_values') : '_values'
const _STATE = typeof Symbol === 'function' ? Symbol('_state') : '_state'

export default class FilterText {
  constructor (name, key, icon, isSearchable, labelFun, alternativeSearch) {
    this.name = name
    this.key = key
    this.icon = icon
    this.isSearchable = isSearchable
    this.itemLabel = labelFun
    this.component = 'FilterText'
    this.alternativeSearch = alternativeSearch
  }

  itemParam (item) {
    return { name: this.name, value: item.key }
  }

  addChildIncludeFilter (body, param) {
    return body.addFilter('terms', this.key, param.values)
  }

  addParentIncludeFilter (body, param) {
    return body.query('has_parent', { parent_type: 'Document' }, q => q.query('terms', this.key, param.values))
  }

  addParentExcludeFilter (body, param) {
    return body.query('has_parent', { parent_type: 'Document' }, q => q.notQuery('terms', this.key, param.values))
  }

  addChildExcludeFilter (body, param) {
    return body.notFilter('terms', this.key, param.values)
  }

  body (body, options) {
    return body.query('match', 'type', 'Document').agg('terms', this.key, this.key, options)
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

  bindState (state) {
    this[_STATE] = this[_STATE] || state
  }

  get state () {
    return this[_STATE]
  }

  get values () {
    return this[_VALUES] || get(this, ['state', 'values', this.name], [])
  }

  set values (values) {
    this[_VALUES] = values
  }

  get reverse () {
    return get(this, ['state', 'reversed'], []).indexOf(this.name) > -1
  }
}
