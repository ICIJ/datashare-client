<template>
  <div
    class="search-results-header"
    :class="{ 'search-results-header--bordered': bordered, [`search-results-header--${position}`]: true }"
  >
    <div class="search-results-header__settings d-flex align-items-center">
      <b-button-group v-if="!noProgress" class="flex-grow-1">
        <b-dropdown
          class="search-results-header__settings__sort"
          menu-class="search-results-header__settings__sort__dropdown"
          toggle-class="text-decoration-none px-2 border search-results-header__settings__sort__toggler"
          size="sm"
          variant="link"
        >
          <template #button-content>
            {{ $t('search.results.sort.sortLabel') }}
          </template>
          <b-dropdown-header>
            {{ $t('search.settings.sortBy') }}
          </b-dropdown-header>
          <b-dropdown-item
            v-for="selectedSort in visibleSorts"
            :key="selectedSort"
            :active="selectedSort === sort"
            @click="selectSort(selectedSort)"
          >
            {{ $t('search.results.sort.' + selectedSort) }}
          </b-dropdown-item>
        </b-dropdown>
        <b-dropdown
          class="search-results-header__settings__size me-2"
          menu-class="search-results-header__settings__size__dropdown pt-0"
          size="sm"
          toggle-class="text-decoration-none py-1 px-2 border search-results-header__settings__size__toggler"
          variant="link"
        >
          <template #button-content>
            <span class="search-results-header__settings__size__toggler__slot">
              {{ firstDocument }} - {{ lastDocument }}
            </span>
            <span
              class="search-results-header__settings__size__toggler__hits text-muted"
              :title="firstLastDocument + ' ' + nbDocuments"
            >
              {{ nbDocuments }}
            </span>
          </template>
          <b-dropdown-header>
            {{ $t('search.settings.resultsPerPage') }}
          </b-dropdown-header>
          <b-dropdown-item
            v-for="selectedSize in sizes"
            :key="selectedSize"
            :active="selectedSize === size"
            @click="selectSize(selectedSize)"
          >
            <div class="d-flex align-items-center">
              <span>{{ selectedSize }} {{ $t('search.results.perPage') }}</span>
            </div>
          </b-dropdown-item>
        </b-dropdown>
      </b-button-group>
      <confirm-button
        v-if="response.total > 0"
        class="search-results-header__settings__btn-download btn btn-link text-nowrap ms-auto"
        :confirmed="batchDownload"
        :label="batchDownloadLabel"
        :yes="$t('global.yes')"
        :no="$t('global.no')"
      >
        <fa icon="download"></fa>
        <span v-if="!noLabels" class="ms-2 d-none d-md-inline">
          {{ $t('search.results.batchDownload') }}
        </span>
      </confirm-button>
      <pagination
        class="search-results-header__settings__pagination justify-content-end text-end"
        :get-to-template="getToTemplate"
        :is-displayed="isDisplayed"
        :no-last-page-link="searchWindowTooLarge"
        :position="position"
        :total="response.total"
      />
    </div>
    <div v-if="position === 'top' && !noFilters" class="search-results-header__applied-search-filters">
      <applied-search-filters />
    </div>
  </div>
</template>

<script>
import { cloneDeep, compact, every, find, isEmpty, get, min } from 'lodash'
import { mapState } from 'vuex'

import settings from '@/utils/settings'
import AppliedSearchFilters from '@/components/AppliedSearchFilters'
import Pagination from '@/components/Pagination'
import features from '@/mixins/features'
import byteSize from '@/utils/byteSize'

/**
 * Search results header displaying sorting and page length options.
 */
export default {
  name: 'SearchResultsHeader',
  components: {
    AppliedSearchFilters,
    Pagination
  },
  mixins: [features],
  props: {
    /**
     * Position of the header.
     * @values top, bottom
     */
    position: {
      type: String,
      default: 'top',
      validator: (value) => ['top', 'bottom'].indexOf(value) >= -1
    },
    /**
     * Use borders
     */
    bordered: {
      type: Boolean
    },
    /**
     * Display the search results page offset.
     */
    noProgress: {
      type: Boolean
    },
    /**
     * Hide the active search filters.
     */
    noFilters: {
      type: Boolean
    },
    /**
     * Hide labels when size is too narrow
     */
    noLabels: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      batchDownloadMaxNbFiles: parseInt(this.$config.get('batchDownloadMaxNbFiles')),
      batchDownloadMaxSize: this.$config.get('batchDownloadMaxSize'),
      mappings: {},
      sizes: [10, 25, 50, 100],
      keywordSorts: ['titleNorm', 'titleNormReverse'],
      sorts: [
        'relevance',
        'creationDateNewest',
        'creationDateOldest',
        'sizeLargest',
        'sizeSmallest',
        'titleNorm',
        'titleNormReverse',
        'path',
        'pathReverse',
        'dateNewest',
        'dateOldest'
      ]
    }
  },
  computed: {
    ...mapState('search', ['from', 'response', 'size', 'sort']),
    fields() {
      return this.keywordSorts.map(this.getSortField).join(',')
    },
    firstDocument() {
      return this.lastDocument === 0 ? 0 : this.from + 1
    },
    lastDocument() {
      return min([this.response.total, this.from + this.size])
    },
    searchWindowTooLarge() {
      return this.response.total + this.size >= this.$config.get('search.maxWindowSize', 1e4)
    },
    sumContentLength() {
      let totalLength = 0
      this.response.hits.forEach((doc) => {
        if (doc.contentLength >= 0) {
          totalLength += doc.contentLength
        }
      })
      return totalLength
    },
    batchDownloadLabel() {
      const warningLabel = compact([this.generateMaxFilesWarningLabel, this.generateMaxSizeWarningLabel]).join(' ')

      if (isEmpty(warningLabel)) {
        return this.generateDownloadLabel
      } else {
        return warningLabel + ' ' + this.$t('search.results.warningConfirm')
      }
    },
    isMaxFilesExceeded() {
      return this.batchDownloadMaxNbFiles !== undefined && this.response.total > this.batchDownloadMaxNbFiles
    },
    isMaxSizeExceeded() {
      return this.batchDownloadMaxSize !== undefined && this.sumContentLength > byteSize(this.batchDownloadMaxSize)
    },
    generateMaxFilesWarningLabel() {
      if (!this.isMaxFilesExceeded) {
        return
      }
      const number = this.$n(this.batchDownloadMaxNbFiles)
      return this.$tc('search.results.warningNumber', this.batchDownloadMaxNbFiles, { number })
    },
    generateMaxSizeWarningLabel() {
      if (!this.isMaxSizeExceeded) {
        return
      }
      const size = this.batchDownloadMaxSize
      return this.$tc('search.results.warningSize', this.batchDownloadMaxSize, { size })
    },
    generateDownloadLabel() {
      const total = this.$n(this.response.total)
      return [
        this.$tc('search.results.batchDownloadSubmit', this.response.total, { total }),
        this.$t('global.confirmLabel')
      ].join(' ')
    },
    nbDocuments() {
      const total = this.$n(this.response.total)
      return this.$tc('search.results.results', this.response.total, { total })
    },
    firstLastDocument() {
      return `${this.firstDocument} - ${this.lastDocument}`
    },
    projectIds() {
      return this.$core.projectIds.join(',')
    },
    uriFromStore() {
      const from = 0
      const query = { ...this.$store.getters['search/toRouteQuery'](), from }
      const { fullPath } = this.$router.resolve({ name: 'search', query })
      return fullPath
    },
    visibleSorts() {
      return this.sorts.filter(this.isSortVisible)
    }
  },
  async created() {
    // We need to load all mappings to filter out non-sortable fields
    this.mappings = await this.$core.api.getMappingsByFields(this.projectIds, this.fields)
  },
  async mounted() {
    // Force page to scroll top at each load
    // Specially for pagination
    document.body.scrollTop = document.documentElement.scrollTop = 0
  },
  methods: {
    getToTemplate() {
      return { name: 'search', query: cloneDeep(this.$store.getters['search/toRouteQuery']()) }
    },
    isDisplayed() {
      return this.response.total > this.size
    },
    isSortVisible(sort) {
      if (this.keywordSorts.includes(sort)) {
        const field = this.getSortField(sort)
        return every(this.mappings, (mapping) => {
          return get(mapping, ['mappings', field, 'mapping', field, 'type']) === 'keyword'
        })
      }
      return true
    },
    getSortField(name) {
      return find(settings.searchSortFields, { name })?.field
    },
    selectSize(size) {
      // Store new search size into store
      this.$store.commit('search/size', size)
      // Change the route
      return this.refreshRouteAndSearch()
    },
    selectSort(sort) {
      // Store new search sort into store
      this.$store.commit('search/sort', sort)
      // Change the route
      return this.refreshRouteAndSearch()
    },
    async refreshRouteAndSearch() {
      await this.refreshRoute()
      await this.refreshSearch()
    },
    refreshRoute() {
      const name = 'search'
      const query = this.$store.getters['search/toRouteQuery']()
      return this.$router.push({ name, query }).catch(() => {})
    },
    refreshSearch() {
      return this.$store.dispatch('search/query')
    },
    batchDownload() {
      this.$store.dispatch('search/runBatchDownload', this.uriFromStore)
      const { href } = this.$router.resolve({ name: 'task.batch-download.list' })
      const body = this.$t('batchDownload.created')
      const linkLabel = this.$t('batchDownload.seeAll')
      this.$toast.info(body, { href, linkLabel })
    },
    byteSize
  }
}
</script>

<style lang="scss" scoped>
.search-results-header {
  padding: 0.5 * $spacer 0;

  &--bordered {
    &.search-results-header--top {
      border-bottom: 1px solid $gray-200;
    }
    &.search-results-header--bottom {
      border-top: 1px solid $gray-200;
    }
  }

  &__settings {
    color: $text-muted;
    font-size: 0.95em;

    &__size,
    &__sort {
      &__toggler {
        font-size: $font-size-sm;
        line-height: inherit;
      }
    }

    &__size {
      &:deep(.search-results-header__settings__size__toggler) {
        display: flex;
        align-items: center;
        gap: 0.5em;
      }

      &:deep(.search-results-header__settings__size__toggler__slot) {
        max-width: 167px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      &:deep(.search-results-header__settings__size__toggler__hits) {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        max-width: 145px;
      }
    }
  }

  .search-results-header__settings__size__dropdown,
  .search-results-header__settings__sort__dropdown {
    min-width: 100%;
    padding-top: 0;

    .dropdown-header {
      background: $gray-100;
      border-bottom: 1px solid $border-color;
      color: $body-color;
      font-weight: bold;
    }

    .dropdown-item,
    .dropdown-header {
      font-size: inherit;
      line-height: inherit;
      padding: 0.25rem 0.75rem;

      &.active .text-muted,
      &:focus .text-muted {
        color: white !important;
        opacity: 0.6;
      }
    }
  }
}
</style>
