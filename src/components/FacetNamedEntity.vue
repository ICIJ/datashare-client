<script>
import mixin from '@/mixins/facets'
import Facet from '@/components/Facet'

export default {
  name: 'FacetNamedEntity',
  components: { Facet },
  mixins: [mixin]
}
</script>

<template>
  <facet :facet="facet" class="facet--named-entity" ref="facet">
    <template slot="item" slot-scope="{ item }">
      <router-link :to="{ name: 'search', query: { q: item.key }}" class="py-2 px-3">
        <div class="badge badge-pill badge-primary mr-1 text-uppercase facet__items__item__key" :title="item.key" v-b-tooltip.hover>
          {{ item.key }}
        </div>
        <div class="text-secondary small facet__items__item__description">
          {{
            $t('aggregations.mentions.item', {
              occurrences: $tc('aggregations.mentions.occurrence', item.doc_count, { count: item.doc_count }),
              documents: $tc('aggregations.mentions.document', item.docs.value, { count: item.docs.value })
            })
          }}
        </div>
      </router-link>
    </template>
  </facet>
</template>

<style lang="scss">
  .facet--named-entity .facet__items__item {
    border: 0;

    .facet__items__item__key {
      white-space: nowrap;
      display: inline-block;
      overflow: hidden;
      max-width: 100%;
      text-overflow: ellipsis;
    }

    .facet__items__item__description {
      font-style: italic;
    }
  }
</style>
