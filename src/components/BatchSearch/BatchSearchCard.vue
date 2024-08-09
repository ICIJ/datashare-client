<script setup>
import CardPanel from '@/components/Card/CardPanel'
import BatchSearchCardActions from '@/components/BatchSearch/BatchSearchCardActions'
import BatchSearchCardDetails from '@/components/BatchSearch/BatchSearchCardDetails'
defineOptions({ name: 'BatchSearchDetails' })
defineProps({
  batchSearch: { type: Object, required: true }
})
</script>

<template>
  <card-panel class="batch-search-card" :title="batchSearch.name" icon="rocket-launch" no-x-icon>
    <batch-search-card-actions
      :uuid="batchSearch.uuid"
      :nb-results="batchSearch.nbResults"
      :projects="batchSearch.projects"
    />

    <batch-search-card-details v-bind="batchSearch" />
  </card-panel>
</template>
