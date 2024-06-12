<template>
  <div class="search-results-table">
    <div v-if="hasResults">
      <div class="d-flex mb-2">
        <div
          v-if="selected.length"
          class="d-inline-flex search-results-table__actions me-2 align-self-start align-items-center"
        >
          <b-list-group horizontal>
            <b-list-group-item
              v-for="action in actions"
              :key="action.id"
              class="search-results-table__actions__action py-2"
              button
              @click="onClick(action.id)"
            >
              <fa v-if="action.icon" :icon="action.icon" :class="action.iconClass"></fa>
              {{ action.label }}
            </b-list-group-item>
          </b-list-group>
          <document-tags-form class="search-results-table__actions__action ms-1" :document="selected" display-form />
        </div>
        <search-results-header
          position="top"
          class="flex-grow-1 align-self-center py-1 ms-auto"
          :no-progress="!!selected.length"
          :no-filters="!!selected.length"
        />
      </div>
      <b-table
        ref="selectableTable"
        v-model:sort-by="sortModel"
        :empty-text="$t('global.emptyTextTable')"
        striped
        hover
        selectable
        responsive
        :busy="$wait.waiting('load results table')"
        :fields="fields"
        :items="items"
        class="border-bottom m-0 small search-results-table__items"
        tbody-tr-class="search-results-table__items__row"
        thead-tr-class="text-nowrap"
        @row-selected="onRowSelected"
        @row-unselected="onRowUnselected"
      >
        <template #cell(relevance)="{ item }">
          <fa
            v-if="item.contentTypeIcon"
            :icon="item.contentTypeIcon"
            fixed-width
            class="search-results-table__items__row__icon"
          />
          <fa
            :icon="['far', isSelected(item) ? 'check-square' : 'square']"
            fixed-width
            class="search-results-table__items__row__checkbox"
          />
        </template>
        <template #cell(index)="{ item }">
          <b-badge variant="light">{{ startCase(item.index) }}</b-badge>
        </template>
        <template #cell(path)="{ item }">
          <router-link
            :to="{ name: 'document', params: item.routerParams, query: { q: query, tab } }"
            class="search-results-table__items__row__title"
          >
            <document-sliced-name :document="item" active-text-truncate show-subject />
          </router-link>
        </template>
        <template #cell(highlight)="{ value }">
          <span class="text-truncate text-muted" v-html="value"></span>
        </template>
        <template #cell(contentLength)="{ value }">
          {{ humanSize(value) }}
        </template>
        <template #cell(actions)="{ item }">
          <document-actions
            :document="item"
            class="float-end btn-group-sm"
            :is-download-allowed="isDownloadAllowed(item)"
            tooltips-placement="left"
          ></document-actions>
        </template>
      </b-table>
      <search-results-header position="bottom" />
    </div>
    <div v-else>
      <search-results-header position="top" class="flex-grow-1 align-self-center" />
      <div class="search-results-table__header border-0 py-5 d-flex flex-column text-center">
        <div class="search-results-table__header__number-of-results">
          {{ $t('search.results.noResults') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { castArray, find, iteratee, startCase, uniqBy } from 'lodash'
import { mapState } from 'vuex'

import DocumentActions from '@/components/DocumentActions'
import DocumentSlicedName from '@/components/DocumentSlicedName'
import DocumentTagsForm from '@/components/DocumentTagsForm'
import SearchResultsHeader from '@/components/SearchResultsHeader'
import humanSize from '@/utils/humanSize'
import settings from '@/utils/settings'

/**
 * Display search results as table.
 */
export default {
  name: 'SearchResultsTable',
  components: {
    DocumentActions,
    DocumentSlicedName,
    DocumentTagsForm,
    SearchResultsHeader
  },
  data() {
    return {
      selected: [],
      items: []
    }
  },
  computed: {
    ...mapState('search', ['indices', 'query', 'response', 'tab']),
    isAllSelected() {
      return this.response.hits.length === this.selected.length
    },
    actions() {
      return [
        {
          id: this.isAllSelected ? 'unselectAll' : 'selectAll',
          label: this.isAllSelected ? this.$t('document.unselectAll') : this.$t('document.selectAll'),
          icon: ['far', this.isAllSelected ? 'check-square' : 'square']
        },
        {
          id: 'star',
          label: this.$t('document.starButton'),
          icon: ['fa', 'star']
        },
        {
          id: 'unstar',
          label: this.$t('document.unstarButton'),
          icon: ['far', 'star']
        }
      ]
    },
    hasResults() {
      return this.response.hits.length > 0
    },
    hasFilters() {
      return (
        this.$store.getters['search/activeFilters'].length > 0 ||
        this.$store.state.search.field !== settings.defaultSearchField
      )
    },
    defaultSortField() {
      return this.fields[0]
    },
    sortBy() {
      const { field } = this.$store.getters['search/sortBy']
      const { key } = find(this.fields, { sortBy: field }) || this.defaultSortField
      return key
    },
    sortDesc() {
      return this.$store.getters['search/sortBy'].desc ? 'desc' : 'asc'
    },
    sortModel: {
      get() {
        return [{ key: this.sortBy, order: this.sortDesc }]
      },
      async set(sortModel) {
        this.items = await this.itemsProvider(sortModel[0])
      }
    },
    fields() {
      return [
        {
          key: 'relevance',
          label: '#',
          headerTitle: 'relevance',
          class: 'pe-1'
        },
        {
          key: 'index',
          label: this.$t('document.project'),
          class: this.indices.length > 1 ? '' : 'd-none'
        },
        {
          key: 'path',
          sortBy: 'path',
          sortable: true,
          label:
            this.$t('document.document') +
            (this.$store.getters['search/sortBy'].field === 'path'
              ? ` (${this.$t('search.results.sortedByPath')})`
              : ''),
          class: 'ps-0'
        },
        {
          key: 'highlight',
          headerTitle: 'highlight',
          formatter: (value) => value?.content?.join(' … ') || ''
        },
        {
          key: 'creationDateHumanShort',
          sortBy: 'metadata.tika_metadata_dcterms_created',
          sortable: true,
          label: this.$t('document.creationDate'),
          class: 'fit'
        },
        {
          key: 'contentLength',
          sortBy: 'contentLength',
          sortable: true,
          label: this.$t('document.size'),
          formatter: (value, name, item) => item?.source?.contentLength,
          class: 'fit'
        },
        {
          key: 'actions',
          label: '',
          headerTitle: 'actions',
          class: 'search-results-table__items__row__actions'
        }
      ]
    }
  },
  async created() {
    this.items = await this.itemsProvider(this.sortModel[0])
  },
  methods: {
    startCase,
    onRowSelected(items) {
      this.selected = uniqBy([...this.selected, ...castArray(items)], iteratee('id'))
    },
    onRowUnselected(items) {
      this.selected = this.selected.filter((item) => !castArray(items).includes(item))
    },
    isSelected(item) {
      return this.selected.includes(item)
    },
    async onClick(actionId) {
      this.$wait.start('load results table')
      switch (actionId) {
        case 'selectAll':
          this.$refs.selectableTable.selectAllRows()
          this.$bvToast.toast(this.$t('document.selected'), { noCloseButton: true, variant: 'success' })
          break
        case 'unselectAll':
          this.$refs.selectableTable.clearSelected()
          this.$bvToast.toast(this.$t('document.unselected'), { noCloseButton: true, variant: 'success' })
          break
        case 'star':
          await this.$store.dispatch('starred/starDocuments', this.selected)
          this.$bvToast.toast(this.$t('document.starred'), { noCloseButton: true, variant: 'success' })
          break
        case 'unstar':
          await this.$store.dispatch('starred/unstarDocuments', this.selected)
          this.$bvToast.toast(this.$t('document.unstarred'), { noCloseButton: true, variant: 'success' })
          break
        default:
          break
      }
      this.$wait.end('load results table')
    },
    async itemsProvider(sortModel) {
      // Refresh response only if sortBy or sortDesc are different from the state
      if (sortModel.key !== this.sortBy || sortModel.order !== this.sortDesc) {
        // Find the table field for the sorting key (or use the first by default)
        const tableField = find(this.fields, { key: sortModel.key }) || this.defaultSortField
        // Find the corresponding sort field in the settings
        const desc = sortModel.order === 'desc'
        const sortField = find(settings.searchSortFields, { field: tableField.sortBy, desc })
        // Update the sort value in the store
        this.$store.commit('search/sort', sortField ? sortField.name : 'relevance')
        // Refresh the store without changing the "isReady"
        await this.$store.dispatch('search/refresh', false)
      }
      return this.response.hits
    },
    humanSize(value) {
      const size = humanSize(value)
      return size === 'unknown' ? this.$t('document.unknown') : size
    },
    isDownloadAllowed({ index }) {
      return !!this.$store.state.downloads.allowedFor[index]
    }
  }
}
</script>

<style lang="scss">
.search-results-table {
  padding: 0 0 $spacer;

  &__items {
    & > .table.b-table > thead {
      --bs-table-bg: white;
      --bs-table-bg-state: white;

      vertical-align: middle;

      & > tr > th.fit {
        padding-right: 0.85em;
      }
    }

    tr td mark {
      font-weight: bold;
      background: transparent;
    }

    &__row {
      &.selected {
        --bs-table-accent-bg: #{rgba($warning, 0.2)};
        --bs-table-active-bg: #{rgba($warning, 0.2)};
        --bs-table-bg-state: #{rgba($warning, 0.2)};
        --bs-table-bg: #{rgba($warning, 0.2)};
        --bs-table-border-color: #{rgba($body-color, 0.1)};
      }

      &__title {
        display: flex;

        &:visited:not(.router-link-active) {
          color: mix(#609, white, 80%);
        }
      }

      td.fit {
        padding-right: 0.85em;
      }

      table tbody tr &__title:hover {
        text-decoration: none;
      }

      table tbody tr:not(.selected):not(:hover) &__checkbox,
      table tbody tr.selected &__icon,
      table tbody tr:hover &__icon {
        display: none;
      }

      table tbody tr &__checkbox,
      table tbody tr &__icon {
        color: $link-color;
      }

      table tbody tr &__actions {
        padding: 0;
        vertical-align: middle;
      }

      td .text-truncate {
        display: block;
        max-width: 20vw;

        .document-sliced-name {
          display: inline-block;
        }
      }
    }
  }

  &__actions {
    font-size: $font-size-sm;

    &__action.document-tags-form {
      align-self: stretch;
      display: inline-flex;

      & > div,
      input.form-control {
        align-self: stretch;
        height: 100%;
      }
    }

    &__action {
      color: $primary;
      width: auto;

      svg {
        margin-right: 0.5em;
      }

      &:hover {
        color: $dark;
      }
    }
  }
}
</style>
