<template>
  <div class="batch-search-status">
    <ellipse-status :status="batchSearch.state" :no-badge="noLabel" horizontal>
      <template v-if="isFailed" #error>
        <div v-if="batchSearch.errorQuery" class="batch-search-status__modal__error-query mb-2 fw-bolder">
          <span v-html="$t('batchSearch.errorQuery', { query: batchSearch.errorQuery })"></span>
        </div>
        <div v-if="batchSearch.errorMessage">
          <template v-if="errorMessageAsJson">
            <json-formatter
              class="batch-search-status__modal__error-message"
              :json="errorMessageAsJson"
              :open="4"
              :config="{ theme: 'dark' }"
            />
          </template>
          <template v-else>
            <pre
              class="batch-search-status__modal__error-message mt-3 mb-0"
            ><code>{{ batchSearch.errorMessage }}</code></pre>
          </template>
          <div class="mt-2" v-html="$t('batchSearch.errorMessage')"></div>
        </div>
      </template>
    </ellipse-status>
  </div>
</template>

<script>
import TaskItemStatus from '@/components/TaskItemStatus'

/**
 * A badge to display batch search status.
 */
export default {
  name: 'BatchSearchStatus',
  components: {
    TaskItemStatus
  },
  props: {
    /**
     * The batch search meta data
     */
    batchSearch: {
      type: Object,
      default: () => ({})
    },
    /**
     * Hide the label
     */
    noLabel: {
      type: Boolean
    }
  }
}
</script>
