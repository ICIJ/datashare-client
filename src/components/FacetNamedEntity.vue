<template>
  <div class="facet-named-entity card card-default">
    <div class="card-header">
      <h6 @click="toggleItems">
        <font-awesome-icon :icon="headerIcon" />
        {{ $t('facet.' + facet.key) }}
      </h6>
    </div>
    <div class="list-group list-group-flush facet-named-entity__items" v-if="!collapseItems">
      <form @submit="asyncFacetSearch" v-if="hasResults && facet.isSearchable">
        <label class="list-group facet__items__search py-2 px-3">
          <input v-model="facetQuery" type="search" :placeholder="$t('search.search-in') + ' ' + $t('facet.' + facet.key) + '...'" />
          <font-awesome-icon icon="search" class="float-right" />
        </label>
      </form>
      <b-modal hide-header hide-footer lazy ref="asyncFacetSearch">
        <facet-search :facet="facet" :query="facetQuery" />
      </b-modal>
      <div class="list-group-item facet-named-entity__items__item" v-for="item in displayedFilteredItems()" :key="item.key">
        <router-link :to="{ name: 'search', query: { q: item.key }}" >
          <div class="badge badge-pill badge-primary mr-1 text-uppercase facet-named-entity__items__item__key" :title="item.key" v-b-tooltip.hover>
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
      <div class="p-2 text-center small text-muted" v-if="isReady && !hasResults">
        {{ $t('facet.none') }}
      </div>
    </div>
  </div>
</template>

<script>
import { mixin } from '@/mixins/facets'

export default {
  name: 'FacetNamedEntity',
  mixins: [mixin]
}
</script>

<style lang="scss">

  .facet-named-entity__items {

    & &__item__key {
      white-space: nowrap;
      display: inline-block;
      overflow: hidden;
      max-width: 100%;
      text-overflow: ellipsis;
    }

    &__item__description {
      font-style: italic;
    }
  }
</style>
