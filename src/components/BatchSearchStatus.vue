<template>
  <task-item-status
    :no-label='noLabel'
    :task-item="{
      ...batchSearch,
      key: 'batchSearch'
    }"
  >
    <template #title>
      <div v-if="batchSearch.errorQuery" class="task-item-status__modal__error-query mb-2 fw-bolder">
        <span v-html="$t('batchSearch.errorQuery', { query: batchSearch.errorQuery })"></span>
      </div>
    </template>
  </task-item-status>
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
