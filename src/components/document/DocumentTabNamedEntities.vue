<template>
  <div class="p-3">
    <div v-if="!isServer && !document.hasNerTags" class="document__named-entities--not--searched">
      <div v-html="$t('document.named_entites_not_searched', { indexing_link: '#/indexing' })"></div>
    </div>
    <div v-else-if="groupByCategories(namedEntities).length === 0" class="document__named-entities--not--found">
      {{ $t('document.named_entities_not_found') }}
    </div>
    <div v-else>
      <div v-for="(results, index) in groupByCategories(namedEntities)" :key="index" class="mb-4">
        <div class="mb-2" :class="getCategoryClass(results[0].source.category, 'text-')">
          <fa :icon="getCategoryIcon(results[0].source.category)" />
          {{ $t('facet.named-entity-' + results[0].source.category.toLowerCase()) }} <i>({{ results.length }})</i>
        </div>
        <span v-for="(result, index) in groupByMentionNorm(results)" :key="index" class="d-inline mr-2">
          <span class="badge badge-pill p-0 badge-light text-uppercase text-black border" :class="getCategoryClass(result[0].source.category, 'border-')">
            <span class="p-1 d-inline-block" :title="capitalize(result[0].source.mentionNorm)"  v-b-tooltip.hover>
              {{ result[0].source.mentionNorm }}
            </span>
            <span class="bg-darkest text-light p-1 px-2 d-inline-block" :title="$tc('aggregations.mentions.occurrence', result.length, { count: result.length })" :class="getCategoryClass(result[0].source.category, 'bg-')" v-b-tooltip.hover>
              {{ result.length }}
            </span>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'
import capitalize from 'lodash/capitalize'
import groupBy from 'lodash/groupBy'
import orderBy from 'lodash/orderBy'

export default {
  name: 'DocumentTabNamedEntities',
  props: ['document'],
  mixins: [ner, utils],
  computed: {
    ...mapState('document', ['namedEntities'])
  },
  mounted () {
    this.$root.$on('facet::hide::named-entities', () => this.$store.dispatch('document/getNamedEntities'))
  },
  methods: {
    groupByCategories (array) {
      return orderBy(groupBy(array, m => m.source.category), ['length', m => m[0].source.category], ['desc', 'asc'])
    },
    groupByMentionNorm (array) {
      return orderBy(groupBy(array, m => m.source.mentionNorm), ['length', m => m[0].source.mentionNorm], ['desc', 'asc'])
    },
    capitalize
  }
}
</script>
