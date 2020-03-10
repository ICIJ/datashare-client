<template>
  <v-wait for="load_data">
    <fa icon="circle-notch" spin size="2x" class="d-flex mx-auto mt-5" slot="waiting" />
    <div class="p-3">
      <div v-if="$config.is('manageDocuments') && !document.hasNerTags" class="document__named-entities document__named-entities--not--searched">
        <div v-html="$t('document.named_entities_not_searched', { indexing_link: '#/indexing' })"></div>
      </div>
      <div v-else-if="!hasNamedEntities && !isLoadingNamedEntities" class="document__named-entities document__named-entities--not--found">
        {{ $t('document.named_entities_not_found') }}
      </div>
      <div v-else-if="!isLoadingNamedEntities" class="document__named-entities">
        <div v-for="(pages, category) in namedEntitiesPaginatedByCategories" :key="category" class="mb-4">
          <div class="mb-2" :class="getCategoryClass(category, 'text-')" v-if="categoryIsNotEmpty(category)">
            <fa :icon="getCategoryIcon(category)" />
            {{ $t('filter.namedEntity' + capitalize(category)) }}
            <i>({{ getCategoryTotal(category) }})</i>
          </div>
          <span v-for="(page, index) in pages" :key="index">
            <span v-for="(ne, index) in page.hits" :key="index" class="d-inline mr-2">
              <b-badge pill variant="light" class="p-0 text-uppercase text-black border" :class="getCategoryClass(category, 'border-')" :id="`named-entity-${ne.id}`">
                <span class="p-1 d-inline-block">
                  {{ ne.source.mentionNorm }}
                </span>
              </b-badge>
              <b-popover :target="`named-entity-${ne.id}`" triggers="hover" placement="top">
                <named-entity-in-context :document="document" :named-entity="ne" />
                <template #title>
                  <div class="text-muted" v-html="$t('namedEntityInContext.title', ne.source)"></div>
                </template>
              </b-popover>
            </span>
          </span>
          <v-wait :for="`load_more_data_${category}`">
            <fa icon="circle-notch" spin size="2x" class="d-flex mx-auto mt-5" slot="waiting" />
            <div v-if="categoryHasNextPage(category)">
              <a class="document__named-entities__more small" href="#" @click.prevent="getNextPageInCategory(category)">
                {{ $t('document.namedEntities.showMore' + capitalize(category)) }}
              </a>
            </div>
          </v-wait>
        </div>
      </div>
    </div>
  </v-wait>
</template>

<script>
import capitalize from 'lodash/capitalize'
import get from 'lodash/get'
import keys from 'lodash/keys'
import sumBy from 'lodash/sumBy'
import { mapState } from 'vuex'

import NamedEntityInContext from '@/components/NamedEntityInContext'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'

export default {
  name: 'DocumentTabNamedEntities',
  props: ['document'],
  mixins: [ner, utils],
  components: {
    NamedEntityInContext
  },
  computed: {
    ...mapState('document', ['isLoadingNamedEntities', 'namedEntitiesPaginatedByCategories']),
    hasNamedEntities () {
      return sumBy(this.categories, category => this.getCategoryTotal(category))
    },
    categories () {
      return keys(this.namedEntitiesPaginatedByCategories)
    },
    namedEntities () {
      return this.$store.getters['document/namedEntities']
    }
  },
  async mounted () {
    this.$wait.start('load_data')
    await this.$store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
    this.$wait.end('load_data')
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
        this.$wait.start('load_more_data_' + category)
        await this.$store.dispatch('document/getNextPageForNamedEntityInCategory', category)
        this.$wait.end('load_more_data_' + category)
      }
    },
    capitalize
  }
}
</script>

<style lang="scss">
  .document__named-entities {
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
