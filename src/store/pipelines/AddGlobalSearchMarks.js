import IdentityPipeline from './IdentityPipeline'
import escapeRegExp from 'lodash/escapeRegExp'

class AddGlobalSearchMarks extends IdentityPipeline {
  apply (content, { globalSearchTerms: terms }) {
    return this.findTerms(content, 'length', terms).reduce(this.addTermMarks, content)
  }
  findTerms (content, field, terms = []) {
    return terms.map(term => {
      const regex = new RegExp(term.regex ? term.label : escapeRegExp(term.label), 'gi')
      term[field] = (content.match(regex) || []).length
      return term
    })
  }
  addTermMarks (content, term, index) {
    const needle = new RegExp(term.label, 'gi')
    const borderColor = AddGlobalSearchMarks.getTermIndexColor(index)
    return content.replace(needle, match => {
      return `<mark class="global-search-term" style="border-color: ${borderColor}">${match}</mark>`
    })
  }
  static getTermIndexColor (index) {
    return AddGlobalSearchMarks.termIndexColors[index % AddGlobalSearchMarks.termIndexColors.length]
  }
  static getTermIndexBorderColor (index) {
    return { 'border-color': AddGlobalSearchMarks.getTermIndexColor(index) }
  }
  static getTermIndexBackgroundColor (index) {
    return { 'background-color': AddGlobalSearchMarks.getTermIndexColor(index) }
  }
  static get termIndexColors () {
    return [
      '#ECFC7A',
      '#CDFD94',
      '#A8FDAC',
      '#52FDEA'
    ]
  }
}

export default AddGlobalSearchMarks
