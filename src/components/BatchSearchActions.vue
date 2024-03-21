<template>
  <div class="batch-search-actions">
    <confirm-button
      v-if="isMyBatchSearch"
      v-b-tooltip.hover
      class="batch-search-actions__item batch-search-actions__item--delete btn btn-light ms-2"
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

    <b-button
      v-if="isMyBatchSearch && isEnded"
      class="batch-search-actions__item action batch-search-actions__item--relaunch ms-2"
      variant="light"
      :disabled="isRelaunched"
      @click="$refs['batch-search-copy-form'].show()"
    >
      <fa icon="redo" class="me-1" />
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
    </b-button>

    <b-dropdown
      v-b-tooltip.hover
      split
      right
      class="batch-search-actions__item batch-search-actions__item--download-queries ms-2"
      variant="light"
      :split-href="downloadQueriesUrl"
      :title="$t('batchSearchResults.downloadQueriesTooltip')"
    >
      <template #button-content>
        <fa icon="download" class="me-1" />
        {{ $t('batchSearchResults.downloadQueries') }}
      </template>
      <b-dropdown-item :href="downloadQueriesWithoutResultsUrl">
        <fa icon="download" class="me-1" />
        {{ $t('batchSearchResults.downloadQueriesWithoutResults') }}
      </b-dropdown-item>
    </b-dropdown>

    <b-button
      v-if="isEnded"
      v-b-tooltip.hover
      class="batch-search-actions__item batch-search-actions__item--download-results ms-2"
      variant="primary"
      :title="$t('batchSearchResults.downloadQueriesTooltip')"
      :href="downloadResultsUrl"
    >
      <fa icon="download" class="me-1" />
      {{ $t('batchSearchResults.downloadResults') }}
    </b-button>
  </div>
</template>

<script>
import { get } from 'lodash'

import { Api } from '@/api'
import BatchSearchCopyForm from '@/components/BatchSearchCopyForm'
import humanNumber from '@/filters/humanNumber'

/**
 * A set of buttons to manage a batch search
 */
export default {
  name: 'BatchSearchActions',
  components: {
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
    downloadQueriesWithoutResultsUrl() {
      return Api.getFullUrl(`/api/batch/search/${this.uuid}/queries?format=csv&maxResults=0`)
    },
    downloadResultsUrl() {
      return Api.getFullUrl(`/api/batch/search/result/csv/${this.uuid}`)
    }
  },
  async created() {
    this.isMyBatchSearch = (await this.$core.auth.getUsername()) === this.user
  },
  methods: {
    async deleteBatchSearch() {
      const batchId = this.uuid
      try {
        await this.$store.dispatch('batchSearch/deleteBatchSearch', { batchId })
        this.$root.$bvToast.toast(this.$t('batchSearch.deleted'), { noCloseButton: true, variant: 'success' })
        return this.$router.push({ name: 'task.batch-search.list' })
      } catch (e) {
        this.$root.$bvToast.toast(this.$t('batchSearch.deleteError'), { noCloseButton: true, variant: 'danger' })
      }
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
