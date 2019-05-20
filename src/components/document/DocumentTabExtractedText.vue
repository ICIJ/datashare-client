<template>
  <div class="p-3">
    <div class="document__header__see-highlights mb-3" :title="$t('document.highlights_caution')" @click="toggleShowNamedEntities" v-if="namedEntities.length">
      <fa :icon="showNamedEntities ? 'toggle-on' : 'toggle-off'" />
      {{ $t('document.see_highlights') }}
    </div>
    <ul class="search-results-item__occurrences" v-if="this.query && this.query !== '*'">
      <li v-for="(term, index) in this.getQueryTerms()" :key="term.label">
        <mark :class="['query-term', 'yellow-' + index]">{{ term.label }}</mark> ({{ term.length }})
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
        map(this.$store.getters['search/retrieveQueryTerms'], (term, index) => {
          markedSourceContent = markedSourceContent.replace(new RegExp(term, 'gi'), match => {
            return `<mark class="query-term yellow-${index}">${match}</mark>`
          })
        })
        if (this.showNamedEntities) {
          return highlight(markedSourceContent, sortedUniqBy(this.namedEntities, ne => ne.source.offset),
            m => `<mark class="ner ${this.getCategoryClass(m.category, 'bg-')}">${m.source.mention}</mark>`,
            r => r,
            m => m.source.mention)
        } else {
          return markedSourceContent
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
