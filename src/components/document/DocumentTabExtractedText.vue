<template>
  <div>
    <ul class="search-results-item__occurrences" v-if="this.query && this.query !== '*'">
      <li v-for="term in this.getQueryTerms()" :key="term.label">
        {{ term.label }} ({{ term.length }})
      </li>
    </ul>
    <div class="text-pre-wrap" v-html="markedSourceContent()" />
  </div>
</template>

<script>
import { highlight } from '@/utils/strings'
import ner from '@/mixins/ner'
import { mapState } from 'vuex'
import concat from 'lodash/concat'
import escape from 'lodash/escape'
import map from 'lodash/map'
import orderBy from 'lodash/orderBy'
import sortedUniqBy from 'lodash/sortedUniqBy'

export default {
  name: 'DocumentTabExtractedText',
  mixins: [ner],
  props: ['document', 'namedEntities', 'showNamedEntities'],
  computed: {
    ...mapState('search', {
      query: 'query'
    })
  },
  methods: {
    markedSourceContent () {
      if (this.document) {
        if (this.showNamedEntities) {
          return highlight(this.document.source.content, sortedUniqBy(this.namedEntities, ne => ne.source.offset), m => {
            return `<mark class="ner ${this.getCategoryClass(m.category, 'bg-')}">${m.source.mention}</mark>`
          }, r => escape(r), m => m.source.mention)
        } else {
          return this.document.source.content
        }
      }
    },
    getQueryTerms () {
      let result = []
      if (this.document.source.content) {
        map(this.$store.getters['search/retrieveQueryTerms'], term => {
          result = concat(result, { label: term, length: (this.document.source.content.match(new RegExp(term, 'gi')) || []).length })
        })
      }
      return orderBy(result, ['length'], ['desc'])
    }
  }
}
</script>

<style lang="scss">
  .text-pre-wrap {
    white-space: pre-wrap;
  }
</style>
