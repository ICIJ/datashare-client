<template>
  <v-wait for="load first page of named entities">
    <fa icon="circle-notch" spin size="2x" class="d-flex mx-auto mt-5" slot="waiting"></fa>
    <div class="p-3">
      <div class="document__named-entities__toolbox">
        <search-form-control v-model="filterToken"
                             :loading="$wait.is('load named entities')"
                             class="document__named-entities__toolbox__filter"
                             :placeholder="$t('document.namedEntityFilter')"></search-form-control>
      </div>
      <div v-if="$config.is('manageDocuments') && !document.hasNerTags"
           class="document__named-entities document__named-entities--not--searched">
        <div v-html="$t('document.namedEntitiesNotSearched', { indexing_link: '#/indexing' })"></div>
      </div>
      <div v-else-if="!hasNamedEntities && !isLoadingNamedEntities"
           class="document__named-entities document__named-entities--not--found">
        {{ $t('document.namedEntitiesNotFound') }}
      </div>
      <div v-else-if="!isLoadingNamedEntities" class="document__named-entities">
        <div v-for="(pages, category) in namedEntitiesPaginatedByCategories" :key="category" class="mb-4">
          <div class="mb-2" :class="getCategoryClass(category, 'text-')" v-if="categoryIsNotEmpty(category)">
            <fa :icon="getCategoryIcon(category)"></fa>
            {{ $t('filter.namedEntity' + capitalize(category)) }}
            <i>({{ getCategoryTotal(category) }})</i>
          </div>
          <span v-for="(page, index) in pages" :key="index">
            <span v-for="(ne, index) in page.hits" :key="index" class="d-inline mr-2">
              <b-badge pill variant="light" class="p-0 text-uppercase text-black border"
                       :class="getCategoryClass(category, 'border-')" :id="`named-entity-${ne.id}`">
                <span class="p-1 d-inline-block">
                  {{ ne.source.mentionNorm }}
                </span>
              </b-badge>
              <b-popover :target="`named-entity-${ne.id}`" triggers="hover" placement="top">
                <named-entity-in-context :document="document" :named-entity="ne"></named-entity-in-context>
                <template #title>
                  <div class="text-muted" v-html="$t('namedEntityInContext.title', ne.source)"></div>
                </template>
              </b-popover>
            </span>
          </span>
          <v-wait :for="`load_more_data_${category}`">
            <fa icon="circle-notch" spin size="2x" class="d-flex mx-auto mt-5" slot="waiting"></fa>
            <div v-if="categoryHasNextPage(category)">
              <a class="document__named-entities__more small" href="#" @click.prevent="getNextPageInCategory(category)">
                {{ $t('document.namedEntitiesShowMore.showMore' + capitalize(category)) }}
              </a>
            </div>
          </v-wait>
        </div>
      </div>
    </div>
  </v-wait>
</template>

<script>
import { capitalize, get, sumBy, throttle } from 'lodash'
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
      filterToken: null
    }
  },
  mixins: [ner, utils],
  components: {
    NamedEntityInContext,
    SearchFormControl
  },
  watch: {
    filterToken (filterToken) {
      // No throttle when the filter token is empty
      if (!filterToken) {
        return this.getFirstPageInAllCategories()
      }
      return this.getFirstPageInAllCategoriesWithThrottle()
    }
  },
  computed: {
    ...mapState('document', ['isLoadingNamedEntities', 'namedEntitiesPaginatedByCategories']),
    hasNamedEntities () {
      return sumBy(this.categories, category => this.getCategoryTotal(category))
    },
    categories () {
      return this.$store.getters['document/categories']
    },
    getFirstPageInAllCategoriesWithThrottle () {
      return throttle(this.getFirstPageInAllCategories, 1000)
    }
  },
  mounted () {
    this.getFirstPageInAllCategories('load first page of named entities')
  },
  methods: {
    getCategoryTotal (category) {
      return get(this, ['namedEntitiesPaginatedByCategories', category, 0, 'total'], 0)
    },
    categoryIsNotEmpty (category) {
      return !!this.getCategoryTotal(category)
    },
    categoryHasNextPage (category) {
      return this.getCategoryTotal(category) > this.$store.getters['document/countNamedEntitiesInCategory'](category)
    },
    async getNextPageInCategory (category) {
      // Don't load named entities if they are already loading
      if (!this.isLoadingNamedEntities) {
        this.$wait.start(`load_more_data_${category}`)
        const filterToken = this.filterToken
        await this.$store.dispatch('document/getNextPageForNamedEntityInCategory', { category, filterToken })
        this.$wait.end(`load_more_data_${category}`)
      }
    },
    async getFirstPageInAllCategories (waitIdentifier = 'load named entities') {
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

    &__more {
      background: $light;
      display: inline-block;
      margin-bottom: $spacer * 0.25;
      padding: $spacer * 0.25 $spacer * 0.5;

      &:hover {
        background: white;
        text-decoration: white;
      }
    }
  }
</style>
