import { reduce, template } from 'lodash'
import { Highlight } from '@/utils/highlight'
import IdentityPipeline from './IdentityPipeline'

class AddNamedEntitiesPipeline extends IdentityPipeline {
  apply (content, { namedEntities, shouldApplyNamedEntitiesMarks }) {
    if (shouldApplyNamedEntitiesMarks) {
      const marks = reduce(namedEntities, (all, { offsets, source: { mention, extractor, category } }) => {
        const length = mention.length
        offsets.forEach(start => {
          if (start > -1) {
            all.push({ start, length, category, extractor })
          }
        })
        return all
      }, [])
      // This is a function called on each highlighted text
      const each = this.buildNamedEntityMark.bind(this)
      return Highlight.create({ content, each }).ranges(marks)
    }
    return content
  }
  buildNamedEntityMark ({ extractor, category, content: mention }) {
    const classNames = this.getCategoryClass(category, 'ner--')
    return this.namedEntityMarkTemplate({ classNames, extractor, mention })
  }
  getCategoryClass (category = 'muted', prefix = '') {
    return `${prefix}category-${category.toLowerCase()}`
  }
  get namedEntityMarkTemplate () {
    return template('<mark class="ner <%= classNames %>" title="<%= extractor %>"><%= mention %></mark>')
  }
}

export default AddNamedEntitiesPipeline
