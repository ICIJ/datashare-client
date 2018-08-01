<script>
import { mixin } from '@/mixins/facets'

export default {
  name: 'FacetText',
  mixins: [mixin]
}
</script>

<template>
  <div class="facet-text card" :class="{ 'facet-text--reversed': isReversed() }">
    <div class="card-header">
      <span v-if="hasValues()" class="float-right btn-group">
        <button class="btn btn-sm btn-outline-secondary py-0" @click="invert" :class="{ 'active': isReversed() }">
          <font-awesome-icon icon="eye-slash" />
          {{ $t('facet.invert') }}
        </button>
      </span>
      <h6 @click="toggleItems">
        <font-awesome-icon :icon="headerIcon" />
        {{ $t('facet.' + facet.key) }}
      </h6>
    </div>
    <div class="list-group list-group-flush facet-text__items" v-if="!collapseItems">
      <form @submit="asyncFacetSearch" v-if="hasResults && facet.isSearchable">
        <label class="list-group facet__items__search py-2 px-3">
          <input v-model="facetQuery" type="search" :placeholder="$t('search.search-in') + ' ' + $t('facet.' + facet.key) + '...'" />
          <font-awesome-icon icon="search" class="float-right" />
        </label>
      </form>
      <b-modal hide-footer lazy ref="asyncFacetSearch" :title="$t('facet.' + facet.key)">
        <facet-search :facet="facet" :query="facetQuery" />
      </b-modal>
      <div class="list-group-item facet-text__items__item p-0" v-for="(item, index) in displayedFilteredItems()" :key="index" :class="{ 'facet-text__items__item--active': hasValue(item) }">
        <a href @click.prevent="toggleValue(item)" class="py-2 px-3">
          <span class="badge badge-pill badge-light float-right facet-text__items__item__count">
            {{ item.doc_count || 0 }}
          </span>
          <span class="facet-text__items__item__label">
            {{ facet.itemLabel ? facet.itemLabel(item) : item.key }}
          </span>
        </a>
      </div>
      <div v-if="!isReady">
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
      </div>
      <div class="list-group-item facet__items__display" @click="toogleDisplay" v-if="shouldDisplayShowMoreAction()">
        <span>{{ display.label }}</span>
        <font-awesome-icon :icon="display.icon" class="float-right" />
      </div>
      <div class="p-2 text-center small text-muted" v-if="isReady && !hasResults">
        {{ $t('facet.none') }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .facet-text {

    &__items {

      &__item {
        position: relative;
        overflow: hidden;

        &--active {

          &:before {
            content: "";
            background: theme-color('primary');
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            width: 3px;
            box-shadow: 0 0 10px 0 theme-color('primary');
          }

          .facet-text--reversed & {
            text-decoration: line-through;

            &:before {
              background: $body-color;
              box-shadow: 0 0 10px 0 $body-color;
            }
          }
        }

        & > a {
          display: block;
        }
      }
    }
  }
</style>
