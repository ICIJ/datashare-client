<script>
import { get, keys, orderBy } from 'lodash'

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
    },
    /**
     * The language to translate the content to
     */
    targetLanguage: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      terms: []
    }
  },
  computed: {
    queryTerms() {
      return this.$store.getters['search/retrieveContentQueryTerms']
    },
    queryTermsWithoutNegation() {
      return this.queryTerms.filter(({ negation }) => !negation)
    },
    index() {
      return this.document.index
    },
    id() {
      return this.document.id
    },
    routing() {
      return this.document.routing
    },
    sortedTerms() {
      return orderBy(this.terms, ['count', 'metadata', 'tags'], ['desc', 'desc', 'desc'])
    },
    metadataFields() {
      return [
        ...keys(this.document.source.metadata).map((m) => `source.metadata.${m}`),
        'source.language',
        'source.path'
      ]
    }
  },
  watch: {
    async targetLanguage() {
      this.terms.splice(0)
      await this.searchTerms()
    }
  },
  async mounted() {
    await this.searchTerms()
  },
  methods: {
    getTermIndexClass(index, term) {
      return {
        [`document-global-search-terms-tags__item--index-${index}`]: true
      }
    },
    searchTermInContent(label) {
      const searchParams = [this.index, this.id, label, this.targetLanguage, this.routing]
      return this.$core.api.searchDocument(...searchParams)
    },
    searchTermInTags(label) {
      const needle = label.toLowerCase()
      const tags = this.document.tags.filter((t) => t.toLowerCase().includes(needle))
      const count = tags.length
      return { count, tags }
    },
    searchTermInMetadata(label) {
      const needle = label.toLowerCase()
      const fields = this.metadataFields
      const metadata = fields.filter((f) => String(get(this.document, f)).toLowerCase().includes(needle))
      const count = metadata.length
      return { count, metadata }
    },
    async searchTerms() {
      for (const { label } of this.queryTermsWithoutNegation) {
        try {
          const { offsets, count } = await this.searchTermInContent(label)
          const { count: tags } = this.searchTermInTags(label)
          const { count: metadata } = this.searchTermInMetadata(label)
          this.terms.push({ label, count, offsets, metadata, tags })
        } catch {
          this.terms.push({ label, count: 0, offsets: 0, metadata: 0, tags: 0 })
        }
      }
    }
  }
}
</script>

<template>
  <div v-if="document && terms.length" class="document-global-search-terms-tags d-flex align-items-center">
    <div class="me-2">
      {{ $t('document.researchedTerms') }}
    </div>
    <ul class="list-inline m-0">
      <li v-for="(term, i) in sortedTerms" :key="i" class="list-inline-item">
        <mark
          class="document-global-search-terms-tags__item"
          :class="getTermIndexClass(i, term)"
          :style="getTermIndexBorderColor(i)"
          @click="$emit('select', term.label)"
        >
          <span class="document-global-search-terms-tags__item__label">
            {{ term.label }}
          </span>
          <span
            v-if="term.count === 0 && term.metadata > 0"
            class="document-global-search-terms-tags__item__count document-global-search-terms-tags__item__metadata py-0"
            :style="getTermIndexBackgroundColor(i)"
          >
            {{ $t('document.inMetadata') }}
          </span>
          <span
            v-else-if="term.count === 0 && term.tags > 0"
            class="document-global-search-terms-tags__item__count document-global-search-terms-tags__item__metadata py-0"
            :style="getTermIndexBackgroundColor(i)"
          >
            {{ $t('document.inTags') }}
          </span>
          <span
            v-else
            class="document-global-search-terms-tags__item__count py-0"
            :style="getTermIndexBackgroundColor(i)"
          >
            {{ term.count }}
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
      box-shadow: 0 3px 0 0 darken($mark-bg, 20%);
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
  }
}
</style>
