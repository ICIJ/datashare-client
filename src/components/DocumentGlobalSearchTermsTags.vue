<script>
import { mapGetters } from 'vuex'

import utils from '@/mixins/utils'

/**
 * A list of search terms tags.
 */
export default {
  name: 'DocumentGlobalSearchTermsTags',
  mixins: [utils],
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  data () {
    return {
      terms: []
    }
  },
  mounted () {
    this.$root.$on('document::content-loaded', this.getTerms)
  },
  computed: {
    ...mapGetters('search', ['retrieveContentQueryTermsInDocument'])
  },
  methods: {
    getTermIndexClass (index, term) {
      return {
        'document-global-search-terms-tags__item--negation': term.negation,
        [`document-global-search-terms-tags__item--index-${index}`]: true
      }
    },
    getTerms () {
      const terms = this.retrieveContentQueryTermsInDocument(this.document)
      this.$set(this, 'terms', terms)
    }
  }
}
</script>

<template>
  <div class="document-global-search-terms-tags d-flex align-items-center" v-if="document && terms.length" v-once>
    <div class="mr-2">
      {{ $t('document.researchedTerms') }}
    </div>
    <ul class="list-inline m-0">
      <li v-for="(term, index) in terms" :key="term.label" class="list-inline-item">
        <mark class="document-global-search-terms-tags__item"
              :class="getTermIndexClass(index, term)"
              @click="$emit('select', term)"
              :style="getTermIndexBorderColor(index)">
          <span class="document-global-search-terms-tags__item__label">
            {{ term.label }}
          </span>
          <span class="document-global-search-terms-tags__item__count document-global-search-terms-tags__item__metadata py-0"
                :style="getTermIndexBackgroundColor(index)"
                v-if="term.content === 0 && term.metadata > 0">
            {{ $t('document.inMetadata') }}
          </span>
          <span class="document-global-search-terms-tags__item__count document-global-search-terms-tags__item__metadata py-0"
                :style="getTermIndexBackgroundColor(index)"
                v-else-if="term.content === 0 && term.tags > 0">
            {{ $t('document.inTags') }}
          </span>
          <span class="document-global-search-terms-tags__item__count py-0"
                :style="getTermIndexBackgroundColor(index)"
                v-else>
            {{ term.content }}
          </span>
        </mark>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
  .document-global-search-terms-tags {
    &__item {
      border-bottom: 3px solid transparent;
      cursor: pointer;

      &:hover {
        box-shadow: 0 3px 0 0 darken(theme-color('mark'), 20%);
      }

      & &__count {
        border-radius: 0.3rem;
        display: inline-block;
        font-size: 0.8rem;
        font-weight: bold;
        height: 1.2rem;
        line-height: 1.2rem;
        min-width: 1.2rem;
        padding: 0 0.2rem;
        position: relative;
        text-align: center;
        top: -0.1rem;
      }

      & &__metadata {
        font-style: italic;
        font-weight: normal;
      }

      &--negation {
        text-decoration: line-through;
      }
    }
  }
</style>
