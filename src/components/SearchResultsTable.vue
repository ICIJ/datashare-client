<template>
  <div class="search-results-table">
    <div v-if="selected.length > 0 && hasFeature('BATCH_STARRED')">
      <b-list-group class="search-results-table__actions" horizontal>
        <b-list-group-item class="search-results-table__actions__action" href="#" v-for="action in actions" :key="action.id" @click="onClick(action.id)">
          <fa :icon="action.icon" />{{ action.label }}
        </b-list-group-item>
      </b-list-group>
    </div>
    <div v-if="hasResults">
      <search-results-header position="top" />
      <b-table
        striped
        hover
        :selectable="hasFeature('BATCH_STARRED')"
        @row-selected="onRowSelected"
        :items="response.hits"
        :fields="fields"
        :busy="isBusy"
        class="bg-white border-bottom m-0 small search-results-table__items"
        tbody-tr-class="search-results-table__items__row">
        <template #name="{ item }">
          <router-link :to="{ name: 'document', params: item.routerParams }" class="text-truncate">
            <fa :icon="item.contentTypeIcon" class="mr-2" />
            <document-sliced-name :document="item" />
          </router-link>
        </template>
        <template #highlight="data">
          <span v-html="data.value" class="text-truncate text-muted"></span>
        </template>
        <template #actions="{ item }">
          <document-actions :document="item" class="float-right btn-group-sm" />
        </template>
      </b-table>
      <search-results-header position="bottom" />
    </div>
    <div v-else>
      <div class="search-results-table__header border-0 py-5 d-flex flex-column text-center">
        <div class="search-results-table__header__number-of-results">
          {{ $t('search.results.no-result') }}
        </div>
        <div class="mt-3" v-if="hasFilters">
          {{ $t('search.try') }}
          <reset-filters-button />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import DocumentSlicedName from '@/components/DocumentSlicedName'
import DocumentActions from '@/components/DocumentActions'
import DocumentThumbnail from '@/components/DocumentThumbnail'
import ResetFiltersButton from '@/components/ResetFiltersButton'
import SearchResultsHeader from '@/components/SearchResultsHeader'
import settings from '@/utils/settings'
import features from '@/mixins/features'

export default {
  name: 'SearchResults',
  mixins: [features],
  components: {
    DocumentActions,
    DocumentSlicedName,
    DocumentThumbnail,
    ResetFiltersButton,
    SearchResultsHeader
  },
  data () {
    return {
      selected: [],
      isBusy: false,
      actions: [{
        id: 'star',
        label: this.$t('document.star_button'),
        icon: ['fa', 'star']
      }, {
        id: 'unstar',
        label: this.$t('document.unstar_button'),
        icon: ['far', 'star']
      }]
    }
  },
  props: {
    fields: {
      type: Array,
      default () {
        return [
          {
            key: 'name',
            label: 'Name'
          },
          {
            key: 'highlight',
            label: '',
            formatter (value) {
              return value ? value.content.join(' [...] ') : ''
            }
          },
          {
            key: 'contentTypeLabel',
            label: 'Type'
          },
          {
            key: 'humanSize',
            label: 'Size'
          },
          {
            key: 'actions',
            label: '',
            class: 'search-results-table__items__row__actions'
          }
        ]
      }
    }
  },
  computed: {
    hasResults () {
      return this.response.hits.length > 0
    },
    hasFilters () {
      return this.$store.getters['search/activeFacets'].length > 0 || this.$store.state.search.field !== settings.defaultSearchField
    },
    ...mapState('search', ['query', 'response'])
  },
  methods: {
    onRowSelected (items) {
      this.selected = items
    },
    async onClick (actionId) {
      this.isBusy = true
      switch (actionId) {
        case 'star':
          await this.$store.dispatch('search/starDocuments', this.selected)
          break
        case 'unstar':
          await this.$store.dispatch('search/unstarDocuments', this.selected)
          break
        default:
          break
      }
      this.isBusy = false
    }
  }
}
</script>

<style lang="scss">
  .search-results-table {
    padding: 0 0 $spacer;

    &__items {

      &__row {

        table tbody tr &__actions {
          padding: 0;
          vertical-align: middle;
        }

        td .text-truncate {
          max-width: 20vw;
          display: block;

          .document-sliced-name {
            display: inline;
          }
        }
      }
    }

    &__actions {

      &__action.list-group-item-action {
        color: $primary;
        width: auto;

        svg {
          margin-right: .5em;
        }
      }
    }
  }
</style>
