<template>
  <div class="document__extracted-text">
    <div class="container-fluid">
      <div class="row border-bottom document__extracted-text__header" v-if="showHeader">
        <div class="col-5 order-2 border-left py-3">
          <div class="custom-control custom-switch document__extracted-text__header__see-highlights" v-if="showNerToggler">
            <input type="checkbox" :checked="showNamedEntities" class="custom-control-input" id="input-see-highlights" @change="toggleShowNamedEntities">
            <label class="custom-control-label font-weight-bold" for="input-see-highlights" id="label-see-highlights">
              {{ $t('document.see_highlights') }}
            </label>
            <b-tooltip placement="bottom" target="label-see-highlights" :title="$t('document.highlights_caution')" />
          </div>
        </div>
        <div class="col">
          <div class="p-3" v-if="showTermsList" v-once>
            <div class="mb-3">{{ $t('document.researched_terms') }}</div>
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
    </div>
    <div class="document__extracted-text__search form-inline" :class="{ 'document__extracted-text__search--visible': isSearchBarShown }">
      <div class="document__extracted-text__search__term form-group py-2 px-3">
        <label class="sr-only">{{ $t('document.search') }}</label>
        <input v-model="searchTerm" @input="startSearch" :placeholder="$t('document.find')" ref="search" class="form-control" v-shortkey="getShortkey()" @shortkey="shortkeyAction" />
      </div>
      <div class="document__extracted-text__search__count form-group" v-if="this.searchTerm.length > 0">
        {{ searchIndex  }} {{ $t('document.of') }} {{ searchOccurrences }}
      </div>
      <div class="form-group">
        <button class="document__extracted-text__search__previous btn btn-sm p-2" @click="findPreviousOccurrence" :disabled="searchOccurrences === 0 || this.searchTerm.length === 0">
          <fa icon="angle-up" />
        </button>
        <button class="document__extracted-text__search__next btn btn-sm p-2" @click="findNextOccurrence" :disabled="searchOccurrences === 0 || this.searchTerm.length === 0">
          <fa icon="angle-down" />
        </button>
      </div>
    </div>
    <div class="document__extracted-text__content p-3" v-html="content" />
  </div>
</template>

<script>
import { highlight } from '@/utils/strings'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'
import { getOS } from '@/utils/utils'
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
  data () {
    return {
      content: '',
      isSearchBarShown: false,
      searchTerm: '',
      searchIndex: 0,
      searchOccurrences: 0
    }
  },
  mounted () {
    this.content = this.markedSourceContent()
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
        let content = this.$sanitize(this.document.source.content, { allowedTags: [] })
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
          term.length = (this.$sanitize(this.document.source.content, { allowedTags: [] }).match(new RegExp(term.label, 'gi')) || []).length
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
    shortkeyAction (event) {
      switch (event.srcKey) {
        case 'showSearchBar':
          this.showSearchBar()
          break
        case 'hideSearchBar':
          this.hideSearchBar()
          break
        case 'findPreviousOccurrence':
        case 'findPreviousOccurrence2':
          this.findPreviousOccurrence()
          break
        case 'findNextOccurrence':
        case 'findNextOccurrence2':
          this.findNextOccurrence()
          break
      }
    },
    showSearchBar () {
      this.$set(this, 'isSearchBarShown', true)
      this.$nextTick(() => {
        if (this.$refs.search) this.$refs.search.focus()
      })
    },
    hideSearchBar () {
      this.$set(this, 'isSearchBarShown', false)
      this.content = this.markedSourceContent()
    },
    getTermIndexClass (index, term) {
      return {
        'document__extracted-text__header__terms__item--negation': term.negation,
        [`document__extracted-text__header__terms__item--index-${index}`]: true
      }
    },
    startSearch () {
      this.searchOccurrences = (this.markedSourceContent().match(new RegExp('(?![^<]*>)' + this.searchTerm, 'gi')) || []).length
      this.searchIndex = this.searchOccurrences > 0 ? 1 : 0
      this.highlightTerm()
    },
    findPreviousOccurrence () {
      if (this.searchOccurrences > 0) {
        this.searchIndex = this.searchIndex === 1 ? this.searchOccurrences : this.searchIndex - 1
        this.highlightTerm()
      }
    },
    findNextOccurrence () {
      if (this.searchOccurrences > 0) {
        this.searchIndex = this.searchIndex === this.searchOccurrences ? 1 : this.searchIndex + 1
        this.highlightTerm()
      }
    },
    highlightTerm () {
      this.$set(this, 'isSearchBarShown', true)
      if (this.searchTerm.length === 0) {
        this.content = this.markedSourceContent()
      } else if (this.searchOccurrences > 0) {
        this.content = this.markedSourceContent().replace(
          RegExp(`^(?:[\\s\\S]*?(?![^<]*>)${this.searchTerm}){${this.searchIndex}}`, 'im'),
          match => match.replace(RegExp(`${this.searchTerm}$`, 'i'), `<mark class="query-term yellow-search">${this.searchTerm}</mark>`)
        )
        this.$nextTick(() => this.$el.querySelector('.query-term').scrollIntoView({ block: 'center', inline: 'nearest' }))
      }
    },
    getShortkey () {
      let shortKey
      switch (getOS()) {
        case 'mac' :
          shortKey = {
            'showSearchBar': ['meta', 'f'],
            'hideSearchBar': ['esc'],
            'findPreviousOccurrence': ['shift', 'enter'],
            'findPreviousOccurrence2': ['shift', 'f3'],
            'findNextOccurrence': ['enter'],
            'findNextOccurrence2': ['f3']
          }
          break
        default :
          shortKey = {
            'showSearchBar': ['ctrl', 'f'],
            'hideSearchBar': ['esc'],
            'findPreviousOccurrence': ['shift', 'enter'],
            'findPreviousOccurrence2': ['shift', 'f3'],
            'findNextOccurrence': ['enter'],
            'findNextOccurrence2': ['f3']
          }
      }
      return shortKey
    }
  }
}
</script>

<style lang="scss">
  .document__extracted-text {
    position: relative;

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

    &__search {
      position: static;
      top: var(--search-document-navbar-height);
      left: 0;
      @include gradient-y($white, $light);

      &--visible {
        position: sticky;
      }
    }

    &__content {
      white-space: pre-wrap;

      mark {
        border-bottom: 3px solid transparent;

        &.yellow-search {
          background-color: yellow;
        }
      }
    }
  }
</style>
