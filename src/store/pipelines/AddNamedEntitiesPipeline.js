import { identity, template } from 'lodash'
import { highlight } from '@/utils/strings'

import IdentityPipeline from './IdentityPipeline'

class AddNamedEntitiesPipeline extends IdentityPipeline {
  apply (content, { namedEntities, shouldApplyNamedEntitiesMarks }) {
    if (shouldApplyNamedEntitiesMarks) {
      return highlight(content, namedEntities, this.buildNamedEntityMark.bind(this), identity, m => m.source.mention)
    }
    return content
  }
  buildNamedEntityMark (ne) {
    const extractor = ne.source.extractor
    const mention = ne.source.mention
    const classNames = this.getCategoryClass(ne.source.category, 'ner--')
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
