<template>
  <div class="p-3">
    <div v-if="$config.is('manageDocuments') && !document.hasNerTags" class="document__named-entities document__named-entities--not--searched">
      <div v-html="$t('document.named_entities_not_searched', { indexing_link: '#/indexing' })"></div>
    </div>
    <div v-else-if="!hasNamedEntities && !isLoadingNamedEntities" class="document__named-entities document__named-entities--not--found">
      {{ $t('document.named_entities_not_found') }}
    </div>
    <div v-else-if="!isLoadingNamedEntities" class="document__named-entities">
      <div v-for="(pages, category) in namedEntitiesPaginatedByCategories" :key="category" class="mb-4" v-if="categoryIsntEmpty(category)">
        <div class="mb-2" :class="getCategoryClass(category, 'text-')">
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
        <div v-if="categoryHasNextPage(category)">
          <a class="document__named-entities__more small" href="#" @click.prevent="getNextPageInCategory(category)">
            {{ $t('document.namedEntities.showMore' + capitalize(category)) }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import capitalize from 'lodash/capitalize'
import get from 'lodash/get'
import keys from 'lodash/keys'
import sumBy from 'lodash/sumBy'
import { mapState } from 'vuex'

import ner from '@/mixins/ner'
import utils from '@/mixins/utils'
import NamedEntityInContext from '@/components/NamedEntityInContext'

export default {
  name: 'DocumentTabNamedEntities',
  props: ['document'],
  mixins: [ner, utils],
  components: {
    NamedEntityInContext
  },
  computed: {
    ...mapState('document', ['namedEntitiesPaginatedByCategories', 'isLoadingNamedEntities']),
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
    await this.$store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
  },
  methods: {
    capitalize,
    getCategoryTotal (category) {
      return get(this, ['namedEntitiesPaginatedByCategories', category, 0, 'total'], 0)
    },
    categoryIsntEmpty (category) {
      return !!this.getCategoryTotal(category)
    },
    categoryHasNextPage (category) {
      return this.getCategoryTotal(category) > this.$store.getters['document/countNamedEntitiesInCategory'](category)
    },
    getNextPageInCategory (category) {
      // Don't load named entities if they are already loading
      if (!this.isLoadingNamedEntities) {
        return this.$store.dispatch('document/getNextPageForNamedEntityInCategory', category)
      }
    }
  }
}
</script>

<style lang="scss">
  .document__named-entities {
    &__more {
      display: inline-block;
      padding: $spacer * 0.25 $spacer * 0.5;
      margin-bottom: $spacer * 0.25;
      background: $light;

      &:hover {
        text-decoration: white;
        background: white;
      }
    }
  }
</style>
