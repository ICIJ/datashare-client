<template>
  <div v-html="markedSourceContent()" />
</template>

<script>
import { highlight } from '@/utils/strings'
import ner from '@/mixins/ner'
import escape from 'lodash/escape'
import sortedUniqBy from 'lodash/sortedUniqBy'

export default {
  name: 'DocumentTabExtractedText',
  mixins: [ner],
  props: ['document', 'namedEntities'],
  methods: {
    markedSourceContent () {
      if (this.document) {
        return highlight(this.document.source.content, sortedUniqBy(this.namedEntities, ne => ne.source.offset), m => {
          return `<mark class="ner ${this.getCategoryClass(m.category, 'bg-')}">${m.source.mention}</mark>`
        }, r => escape(r), m => m.source.mention)
      }
    }
  }
}
</script>
