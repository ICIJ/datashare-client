import includes from 'lodash/includes'
import some from 'lodash/some'

export default class FilterText {
  constructor (name, key, icon, isSearchable, labelFun, alternativeSearch) {
    this.name = name
    this.key = key
    this.icon = icon
    this.isSearchable = isSearchable
    this.itemLabel = labelFun
    this.reverse = false
    this.values = []
    this.component = 'FacetText'
    this.alternativeSearch = alternativeSearch
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
}
