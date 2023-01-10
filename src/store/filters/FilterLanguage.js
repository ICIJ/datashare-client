import FilterText from './FilterText'

export default class FilterLanguage extends FilterText {
  itemLabel(item) {
    return `filter.lang.${item.key}`
  }
}
