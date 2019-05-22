<template>
  <div class="p-3">
    <div class="document__header__see-highlights mb-3" :title="$t('document.highlights_caution')" @click="toggleShowNamedEntities" v-if="namedEntities.length">
      <fa :icon="showNamedEntities ? 'toggle-on' : 'toggle-off'" />
      {{ $t('document.see_highlights') }}
    </div>
    <ul class="search-results-item__occurrences" v-if="this.query && this.query !== '*'">
      <li v-for="(term, index) in getQueryTerms()" :key="term.label">
        <mark :class="['query-term', 'yellow-' + index, term.negation ? 'strikethrough' : '']">{{ term.label }}</mark> ({{ term.length }})
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
import filter from 'lodash/filter'
import map from 'lodash/map'
import orderBy from 'lodash/orderBy'
import sortedUniqBy from 'lodash/sortedUniqBy'

export default {
  name: 'DocumentTabExtractedText',
  mixins: [ner],
  props: ['document', 'namedEntities'],
  computed: {
    ...mapState('search', ['query']),
    ...mapState('document', ['showNamedEntities'])
  },
  methods: {
    markedSourceContent () {
      if (this.document) {
        let markedSourceContent = this.document.source.content
        const queryTerms = this.retrieveQueryTerms()
        map(queryTerms, (term, index) => {
          markedSourceContent = markedSourceContent.replace(new RegExp(term.label, 'gi'), match => `<mark class="query-term yellow-${index}">${match}</mark>`)
        })
        if (this.showNamedEntities) {
          markedSourceContent = highlight(markedSourceContent, sortedUniqBy(this.namedEntities, ne => ne.source.offset),
            m => `<mark class="ner ${this.getCategoryClass(m.category, 'bg-')}">${m.source.mention}</mark>`,
            r => r,
            m => m.source.mention)
        }
        return markedSourceContent
      }
    },
    getQueryTerms () {
      let terms = []
      if (this.document.source.content) {
        const queryTerms = this.retrieveQueryTerms()
        map(queryTerms, term => {
          term.length = (this.document.source.content.match(new RegExp(term.label, 'gi')) || []).length
          terms = concat(terms, term)
        })
      }
      return orderBy(terms, ['length'], ['desc'])
    },
    retrieveQueryTerms () {
      return filter(this.$store.getters['search/retrieveQueryTerms'], item => ['', 'content'].includes(item.field))
    },
    toggleShowNamedEntities () {
      this.$store.commit('document/toggleShowNamedEntities')
    }
  }
}
</script>

<style lang="scss">
  .text-pre-wrap {
    white-space: pre-wrap;
  }

  .query-term {
    &.strikethrough {
      text-decoration: line-through;
    }
    &.yellow-0 {
      background-color: #CD6226;
    }
    &.yellow-1 {
      background-color: #DCB231;
    }
    &.yellow-2 {
      background-color: #BA8660;
    }
    &.yellow-3 {
      background-color: #BC9348;
    }
    &.yellow-4 {
      background-color: #AF9780;
    }
  }
</style>
