<template>
  <div class="container-fluid">
    <div class="row border-bottom document__extracted-text__header" v-if="showHeader">
      <div class="col-3 order-2 border-left py-3 text-center" v-if="showNerToggler">
        <div class="custom-control custom-switch document__extracted-text__header__see-highlights">
          <input type="checkbox" :checked="showNamedEntities" class="custom-control-input" id="input-see-highlights" @change="toggleShowNamedEntities">
          <label class="custom-control-label font-weight-bold" for="input-see-highlights" id="label-see-highlights">
            {{ $t('document.see_highlights') }}
          </label>
          <b-tooltip placement="bottom" target="label-see-highlights" :title="$t('document.highlights_caution')" />
        </div>
      </div>
      <div class="col">
        <div class="p-3" v-if="showTermsList" v-once>
          <div class="mb-3">Researched terms in this document:</div>
          <ul class="document__extracted-text__header__terms list-inline m-0">
            <li v-for="(term, index) in getQueryTerms()" :key="term.label" class="mb-2 list-inline-item">
              <mark class="document__extracted-text__header__terms__item" :style="getTermIndexBorderColor(index)" :class="getTermIndexClass(index, term)">
                <span class="document__extracted-text__header__terms__item__label">
                  {{ term.label }}
                </span>
                <span class="document__extracted-text__header__terms__item__count py-0" :style="getTermIndexBackgroundColor(index)">
                  {{ term.length }}
                </span>
              </mark>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="document__extracted-text__content p-3" v-html="markedSourceContent()" />
  </div>
</template>

<script>
import { highlight } from '@/utils/strings'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'
import { mapState } from 'vuex'
import concat from 'lodash/concat'
import filter from 'lodash/filter'
import identity from 'lodash/identity'
import map from 'lodash/map'
import orderBy from 'lodash/orderBy'
import sortedUniqBy from 'lodash/sortedUniqBy'
import template from 'lodash/template'

export default {
  name: 'DocumentTabExtractedText',
  mixins: [ner, utils],
  props: ['document', 'namedEntities'],
  computed: {
    ...mapState('search', ['query']),
    ...mapState('document', ['showNamedEntities']),
    showNerToggler () {
      return !!this.namedEntities.length
    },
    showTermsList () {
      return !!this.getQueryTerms().length
    },
    showHeader () {
      return this.showTermsList || this.showNerToggler
    },
    namedEntityMarkTemplate () {
      return template('<mark class="ner <%= classNames %>" title="<%= extractor %>"><%= icon %> <%= mention %></mark>')
    }
  },
  methods: {
    namedEntityMark (ne) {
      const extractor = ne.source.extractor
      const icon = this.getCategoryIconSvg(ne.source.category)
      const mention = ne.source.mention
      const classNames = this.getCategoryClass(ne.source.category, 'ner--')
      return this.namedEntityMarkTemplate({ classNames, extractor, icon, mention })
    },
    markedSourceContent () {
      if (this.document) {
        let content = this.document.source.content
        // Add the named entities marks
        if (this.showNamedEntities) {
          const sortedNamedEntities = sortedUniqBy(this.namedEntities, ne => ne.source.offset)
          content = highlight(content, sortedNamedEntities, this.namedEntityMark, identity, m => m.source.mention)
        }
        // Add the query terms marks
        this.getQueryTerms().forEach((term, index) => {
          const needle = new RegExp(term.label, 'gi')
          const fn = match => `<mark style="border-color: ${this.getTermIndexColor(index)}">${match}</mark>`
          content = content.replace(needle, fn)
        })
        return content
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
    },
    getTermIndexClass (index, term) {
      return {
        'document__extracted-text__header__terms__item--negation': term.negation,
        [`document__extracted-text__header__terms__item--index-${index}`]: true
      }
    }
  }
}
</script>

<style lang="scss">
  .document__extracted-text {

    &__header {

      &__terms {

        &__item {
          border-bottom: 3px solid transparent;

          & &__count {
            position: relative;
            top: -0.1rem;
            padding: 0;
            display: inline-block;
            height: 1.2rem;
            line-height: 1.2rem;
            font-size: 0.8rem;
            font-weight: bold;
            padding: 0 0.2rem;
            min-width: 1.2rem;
            border-radius: 0.3rem;
            text-align: center;
          }

          &--negation {
            text-decoration: line-through;
          }
        }
      }
    }

    &__content {
      white-space: pre-wrap;

      mark {
        border-bottom: 3px solid transparent;
      }
    }
  }
</style>
