import { reduce, template } from 'lodash'
import { highlight } from '@/utils/strings'

import IdentityPipeline from './IdentityPipeline'

class AddNamedEntitiesPipeline extends IdentityPipeline {
  apply (content, { namedEntities, shouldApplyNamedEntitiesMarks }) {
    if (shouldApplyNamedEntitiesMarks) {
      const marks = reduce(namedEntities, (all, { offsets, source: { mention, extractor, category } }) => {
        offsets.forEach(index => {
          if (index > -1) {
            all.push({ content: mention, index, category, extractor })
          }
        })
        return all
      }, [])
      return highlight(content, marks, this.buildNamedEntityMark.bind(this))
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
