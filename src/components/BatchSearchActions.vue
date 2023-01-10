<template>
  <div class="batch-search-actions">
    <b-btn
      id="batch-search-actions-filters-toggle"
      v-b-tooltip.hover
      class="batch-search-actions__item"
      variant="light"
      :title="$t('batchSearchResultsFilters.queries.heading')"
    >
      <fa icon="filter" />
      <span class="sr-only">
        {{ $t('batchSearchResultsFilters.queries.heading') }}
      </span>
      <b-badge v-if="nbSelectedQueries" variant="secondary" class="batch-search-actions__item__counter">
        {{ nbSelectedQueries | humanNumber }}
      </b-badge>
      <keep-alive>
        <b-popover
          custom-class="popover-body-p-0"
          lazy
          placement="bottom"
          target="batch-search-actions-filters-toggle"
          triggers="focus"
        >
          <batch-search-results-filters :query-keys="queryKeys" :indices="projects" hide-border />
        </b-popover>
      </keep-alive>
    </b-btn>

    <confirm-button
      v-if="isMyBatchSearch"
      v-b-tooltip.hover
      class="batch-search-actions__item batch-search-actions__item--delete btn btn-light ml-2"
      :confirmed="deleteBatchSearch"
      :label="$t('batchSearch.delete')"
      :no="$t('global.no')"
      :yes="$t('global.yes')"
      :title="$t('batchSearch.delete')"
    >
      <fa icon="trash-alt" />
      <span class="sr-only">
        {{ $t('batchSearch.delete') }}
      </span>
    </confirm-button>

    <b-btn
      v-if="isMyBatchSearch && isEnded"
      class="batch-search-actions__item action batch-search-actions__item--relaunch ml-2"
      variant="light"
      :disabled="isRelaunched"
      @click="$refs['batch-search-copy-form'].show()"
    >
      <fa icon="redo" />
      {{ $t('batchSearchResults.relaunch') }}
      <b-modal
        ref="batch-search-copy-form"
        body-class="p-0"
        hide-footer
        size="md"
        :title="$t('batchSearchResults.relaunchTitle')"
      >
        <batch-search-copy-form :batch-search="batchSearch" />
      </b-modal>
    </b-btn>

    <b-btn
      v-b-tooltip.hover
      class="batch-search-actions__item batch-search-actions__item--download-queries ml-2"
      variant="light"
      :title="$t('batchSearchResults.downloadQueriesTooltip')"
      :href="downloadQueriesUrl"
    >
      <fa icon="download" />
      {{ $t('batchSearchResults.downloadQueries') }}
    </b-btn>

    <b-btn
      v-if="isEnded"
      v-b-tooltip.hover
      class="batch-search-actions__item batch-search-actions__item--download-results ml-2"
      variant="primary"
      :title="$t('batchSearchResults.downloadQueriesTooltip')"
      :href="downloadResultsUrl"
    >
      <fa icon="download" />
      {{ $t('batchSearchResults.downloadResults') }}
    </b-btn>
  </div>
</template>

<script>
import { get } from 'lodash'
import { mapGetters } from 'vuex'
import { Api } from '@/api'

import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import BatchSearchCopyForm from '@/components/BatchSearchCopyForm'
import humanNumber from '@/filters/humanNumber'

/**
 * A set of buttons to manage a batch search
 */
export default {
  name: 'BatchSearchActions',
  components: {
    BatchSearchResultsFilters,
    BatchSearchCopyForm
  },
  filters: {
    humanNumber
  },
  props: {
    /**
     * The batch search meta data
     */
    batchSearch: {
      type: Object
    }
  },
  data() {
    return {
      isMyBatchSearch: false,
      isRelaunched: false
    }
  },
  computed: {
    ...mapGetters('batchSearch', ['nbSelectedQueries', 'queryKeys']),
    user() {
      return get(this, 'batchSearch.user.id')
    },
    uuid() {
      return get(this, 'batchSearch.uuid')
    },
    projects() {
      return get(this, 'batchSearch.projects').map((project) => project.name)
    },
    isEnded() {
      return ['SUCCESS', 'FAILURE'].indexOf(this.batchSearch.state) > -1
    },
    downloadQueriesUrl() {
      return Api.getFullUrl(`/api/batch/search/${this.uuid}/queries?format=csv`)
    },
    downloadResultsUrl() {
      return Api.getFullUrl(`/api/batch/search/result/csv/${this.uuid}`)
    }
  },
  async created() {
    this.isMyBatchSearch = (await this.$core.auth.getUsername()) === this.user
    this.getQueries()
  },
  methods: {
    async deleteBatchSearch() {
      const batchId = this.uuid
      const isDeleted = await this.$store.dispatch('batchSearch/deleteBatchSearch', { batchId })
      if (isDeleted) {
        this.$root.$bvToast.toast(this.$t('batchSearch.deleted'), { noCloseButton: true, variant: 'success' })
      } else {
        this.$root.$bvToast.toast(this.$t('batchSearch.notDeleted'), { noCloseButton: true, variant: 'warning' })
      }
      this.$router.push({ name: 'batch-search' })
    },
    getQueries() {
      return this.$store.dispatch('batchSearch/getBatchSearchQueries', this.uuid)
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
