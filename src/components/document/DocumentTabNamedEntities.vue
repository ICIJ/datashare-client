<template>
  <v-wait for="load first page of named entities">
    <fa slot="waiting" icon="circle-notch" spin size="2x" class="d-flex mx-auto mt-5"></fa>
    <div class="p-3">
      <div class="document__named-entities__toolbox">
        <search-form-control
          v-model="filterToken"
          :loading="$wait.is('load named entities')"
          class="document__named-entities__toolbox__filter"
          :placeholder="$t('document.namedEntityFilter')"
        ></search-form-control>
      </div>
      <div
        v-if="$config.is('manageDocuments') && !document.hasNerTags"
        class="document__named-entities document__named-entities--not--searched"
      >
        <div v-html="$t('document.namedEntitiesNotSearched', { indexing_link: '#/indexing' })"></div>
      </div>
      <div
        v-else-if="!hasNamedEntities && !isLoadingNamedEntities"
        class="document__named-entities document__named-entities--not--found"
      >
        {{ $t('document.namedEntitiesNotFound') }}
      </div>
      <div v-else-if="!isLoadingNamedEntities" class="document__named-entitie">
        <div v-for="(hits, category) in namedEntitiesByCategories" :key="category" class="s border-bottom pb-4 mb-4">
          <div
            v-if="categoryIsNotEmpty(category)"
            class="mb-2 d-flex align-items-center"
            :class="getCategoryClass(category, 'text-')"
          >
            <fa :icon="getCategoryIcon(category)" class="mr-2" />
            {{ $t('filter.namedEntity' + capitalize(category)) }}
            <i>({{ getCategoryTotal(category) }})</i>
            <div class="ml-auto">
              <haptic-copy class="btn-light btn-sm py-1" :label="$t('document.copyAsCsv')" :text="hitsAsCsv(hits)" />
            </div>
          </div>
          <span v-for="(ne, index) in hits" :key="index" class="d-inline-block">
            <b-badge
              :id="`named-entity-${ne.id}`"
              class="p-1 text-uppercase text-black border"
              pill
              variant="light"
              :class="getCategoryClass(category, 'border-')"
            >
              {{ ne.source.mentionNorm }}
            </b-badge>
            <span>&nbsp;</span>
            <b-popover :target="`named-entity-${ne.id}`" triggers="hover" placement="top">
              <named-entity-in-context :document="document" :named-entity="ne"></named-entity-in-context>
              <template #title>
                <div class="d-flex">
                  <div class="text-muted" v-html="$t('namedEntityInContext.title', ne.source)"></div>
                  <div v-if="ne.offsets.length > 1" class="ml-auto pl-2">
                    {{ $tc('document.namedEntitiesOccurences', ne.offsets.length, { count: ne.offsets.length }) }}
                  </div>
                </div>
              </template>
            </b-popover>
          </span>
          <v-wait :for="`load_more_data_${category}`">
            <fa slot="waiting" icon="circle-notch" spin size="2x" class="d-flex mx-auto mt-3" />
            <div v-if="categoryHasNextPage(category)" class="mt-3 text-center">
              <b-btn
                class="document__named-entities__more"
                size="sm"
                variant="link"
                @click.prevent="getNextPageInCategory(category)"
              >
                {{ $t('document.namedEntitiesShowMore.showMore' + capitalize(category)) }}
              </b-btn>
            </div>
          </v-wait>
        </div>
      </div>
    </div>
  </v-wait>
</template>

<script>
import { capitalize, flatten, get, mapValues, sumBy, pickBy, throttle } from 'lodash'
import { mapState } from 'vuex'

import NamedEntityInContext from '@/components/NamedEntityInContext'
import SearchFormControl from '@/components/SearchFormControl'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'

/**
 * A panel to navigate through the named entities of a document
 */
export default {
  name: 'DocumentTabNamedEntities',
  components: {
    NamedEntityInContext,
    SearchFormControl
  },
  mixins: [ner, utils],
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  data() {
    return {
      filterToken: null
    }
  },
  computed: {
    ...mapState('document', ['isLoadingNamedEntities', 'namedEntitiesPaginatedByCategories']),
    hasNamedEntities() {
      return sumBy(this.categories, (category) => this.getCategoryTotal(category))
    },
    namedEntitiesByCategories() {
      const namedEntitiesByCategories = mapValues(this.namedEntitiesPaginatedByCategories, (pages) => {
        return flatten(pages.map((page) => page.hits))
      })
      return pickBy(namedEntitiesByCategories, (hits) => !!hits.length)
    },
    categories() {
      return this.$store.getters['document/categories']
    },
    getFirstPageInAllCategoriesWithThrottle() {
      return throttle(this.getFirstPageInAllCategories, 1000)
    }
  },
  watch: {
    filterToken(filterToken) {
      // No throttle when the filter token is empty
      if (!filterToken) {
        return this.getFirstPageInAllCategories()
      }
      return this.getFirstPageInAllCategoriesWithThrottle()
    }
  },
  mounted() {
    this.getFirstPageInAllCategories('load first page of named entities')
  },
  methods: {
    hitsAsCsv(hits = []) {
      const csvHeader = ['named entity', 'occurences'].join(',')
      const csvBody = hits
        .map(({ source }) => {
          return [source.mentionNorm, source.offsets.length].join(',')
        })
        .join('\n')
      return [csvHeader, csvBody].join('\n')
    },
    getCategoryTotal(category) {
      return get(this, ['namedEntitiesPaginatedByCategories', category, 0, 'total'], 0)
    },
    categoryIsNotEmpty(category) {
      return !!this.getCategoryTotal(category)
    },
    categoryHasNextPage(category) {
      return this.getCategoryTotal(category) > this.$store.getters['document/countNamedEntitiesInCategory'](category)
    },
    async getNextPageInCategory(category) {
      // Don't load named entities if they are already loading
      if (!this.isLoadingNamedEntities) {
        this.$wait.start(`load_more_data_${category}`)
        const filterToken = this.filterToken
        await this.$store.dispatch('document/getNextPageForNamedEntityInCategory', { category, filterToken })
        this.$wait.end(`load_more_data_${category}`)
      }
    },
    async getFirstPageInAllCategories(waitIdentifier = 'load named entities') {
      this.$wait.start(waitIdentifier)
      const filterToken = this.filterToken
      await this.$store.dispatch('document/getFirstPageForNamedEntityInAllCategories', { filterToken })
      this.$wait.end(waitIdentifier)
    },
    capitalize
  }
}
</script>

<style lang="scss" scoped>
.document__named-entities {
  &__toolbox {
    background: $lighter;
    display: flex;
    margin: 0 0 $spacer;
    padding: $spacer-xs $spacer;

    &__filter {
      margin-left: auto;
      max-width: 300px;
      width: 100%;
    }
  }
}
</style>
