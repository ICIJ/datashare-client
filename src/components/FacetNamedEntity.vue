<template>
  <div class="facet-named-entity card card-default">
    <div class="card-header">
      <h6 @click="toggleItems">
        <font-awesome-icon :icon="headerIcon" />
        {{ $t('facet.' + facet.key) }}
      </h6>
    </div>
    <div class="list-group list-group-flush facet-named-entity__items" v-if="!collapseItems">
      <div class="list-group facet__items__search py-2 px-3" v-if="filteredItems.length > 0">
        <input v-model="facetQuery" type="search" :placeholder="$t('search.search-in') + ' ' + $t('facet.' + facet.key) + '...'" />
        <font-awesome-icon icon="search" class="float-right" />
      </div>
      <div class="list-group-item facet-named-entity__items__item" v-for="item in displayedFilteredItems()" :key="item.key">
        <router-link :to="{ name: 'search', query: { q: item.key }}" >
          <div class="badge badge-pill badge-primary mr-1 text-uppercase facet-named-entity__items__item__key">
            {{ item.key }}
          </div>
          <div class="text-secondary small facet-named-entity__items__item__description">
            {{
              $t('aggregations.mentions.item', {
                occurrences: $tc('aggregations.mentions.occurrence', item.doc_count, { count: item.doc_count }),
                documents: $tc('aggregations.mentions.document', item.docs.value, { count: item.docs.value })
              })
            }}
          </div>
        </router-link>
      </div>
      <div class="list-group-item facet__items__display" @click="toogleDisplay" v-if="shouldDisplayShowMoreAction()">
        <span>{{ display.label }}</span>
        <font-awesome-icon :icon="display.icon" class="float-right"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mixin } from 'mixins/facets'

export default {
  name: 'FacetNamedEntity',
  props: ['facet'],
  mixins: [mixin]
}
</script>

<style lang="scss">

  .facet-named-entity__items {

    &__item__key {
      white-space: normal;
    }

    &__item__description {
      font-style: italic;
    }
  }
</style>
