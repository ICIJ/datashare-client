<template>
  <div class="batch-search-actions">
    <b-btn class="batch-search-actions__item"
           id="batch-search-actions-filters-toggle"
           v-b-tooltip.hover
           variant="light"
           :title="$t('batchSearchResultsFilters.queries.heading')">
      <fa icon="filter" />
      <span class="sr-only">
        {{ $t('batchSearchResultsFilters.queries.heading') }}
      </span>
      <b-badge variant="secondary" class="batch-search-actions__item__counter" v-if="selectedQueries.length">
        {{ selectedQueries.length | humanNumber }}
      </b-badge>
      <b-popover custom-class="popover-body-p-0"
                 lazy
                 placement="bottom"
                 target="batch-search-actions-filters-toggle"
                 triggers="focus" >
        <batch-search-results-filters :uuid="uuid" :indices="projects" hide-border />
      </b-popover>
    </b-btn>

    <confirm-button class="batch-search-actions__item batch-search-actions__item--delete btn btn-light ml-2"
                    v-b-tooltip.hover
                    v-if="isMyBatchSearch"
                    :confirmed="deleteBatchSearch"
                    :label="$t('batchSearch.delete')"
                    :no="$t('global.no')"
                    :yes="$t('global.yes')"
                    :title="$t('batchSearch.delete')">
      <fa icon="trash-alt" />
      <span class="sr-only">
        {{ $t('batchSearch.delete') }}
      </span>
    </confirm-button>

    <b-btn class="batch-search-actions__item action batch-search-actions__item--relaunch ml-2"
           v-if="isMyBatchSearch && isEnded"
           variant="light"
           @click="$refs['batch-search-copy-form'].show()"
           :disabled="isRelaunched">
      <fa icon="redo" />
      {{ $t('batchSearchResults.relaunch') }}
      <b-modal body-class="p-0"
               hide-footer
               ref="batch-search-copy-form"
               size="md"
               :title="$t('batchSearchResults.relaunchTitle')">
        <batch-search-copy-form :batch-search="batchSearch" />
      </b-modal>
    </b-btn>

    <b-btn class="batch-search-actions__item batch-search-actions__item--download-queries ml-2"
           variant="light"
           v-b-tooltip.hover
           :title="$t('batchSearchResults.downloadQueriesTooltip')"
           :href="downloadQueriesUrl">
      <fa icon="download" />
      {{ $t('batchSearchResults.downloadQueries') }}
    </b-btn>

    <b-btn class="batch-search-actions__item batch-search-actions__item--download-results ml-2"
           v-if="isEnded"
           variant="primary"
           v-b-tooltip.hover
           :title="$t('batchSearchResults.downloadQueriesTooltip')"
           :href="downloadResultsUrl">
      <fa icon="download" />
      {{ $t('batchSearchResults.downloadResults') }}
    </b-btn>
  </div>
</template>

<script>
import { get } from 'lodash'
import Api from '@/api'
import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import BatchSearchCopyForm from '@/components/BatchSearchCopyForm'
import humanNumber from '@/filters/humanNumber'

/**
 * A set of buttons to manage a batch search
 */
export default {
  name: 'BatchSearchActions',
  props: {
    /**
     * The batch search meta data
     */
    batchSearch: {
      type: Object
    }
  },
  components: {
    BatchSearchResultsFilters,
    BatchSearchCopyForm
  },
  filters: {
    humanNumber
  },
  data () {
    return {
      isMyBatchSearch: false,
      isRelaunched: false
    }
  },
  computed: {
    selectedQueries () {
      return get(this, '$store.state.batchSearch.selectedQueries', [])
    },
    user () {
      return get(this, 'batchSearch.user.id')
    },
    uuid () {
      return get(this, 'batchSearch.uuid')
    },
    projects () {
      return get(this, 'batchSearch.projects').map(project => project.name)
    },
    isEnded () {
      return ['SUCCESS', 'FAILURE'].indexOf(this.batchSearch.state) > -1
    },
    downloadQueriesUrl () {
      return Api.getFullUrl(`/api/batch/search/${this.uuid}/queries?format=csv`)
    },
    downloadResultsUrl () {
      return Api.getFullUrl(`/api/batch/search/result/csv/${this.uuid}`)
    }
  },
  async created () {
    this.isMyBatchSearch = await this.$core.auth.getUsername() === this.user
  },
  methods: {
    async deleteBatchSearch () {
      const batchId = this.uuid
      const isDeleted = await this.$store.dispatch('batchSearch/deleteBatchSearch', { batchId })
      if (isDeleted) {
        this.$root.$bvToast.toast(this.$t('batchSearch.deleted'), { noCloseButton: true, variant: 'success' })
      } else {
        this.$root.$bvToast.toast(this.$t('batchSearch.notDeleted'), { noCloseButton: true, variant: 'warning' })
      }
      this.$router.push({ name: 'batch-search' })
    }
  }
}
</script>

<style lang="scss">
  .batch-search-actions {

    &__item {
      position: relative;

      & &__counter {
        margin: 0;
        position: absolute;
        right: 0;
        top: 0;
        transform: translate(50%, -50%);
        z-index: 100;
      }
    }
  }
</style>
