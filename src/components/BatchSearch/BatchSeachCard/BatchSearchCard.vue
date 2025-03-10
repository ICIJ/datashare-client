<script setup>
import { useI18n } from 'vue-i18n'

import CardPanel from '@/components/CardPanel/CardPanel'
import BatchSearchActions from '@/components/BatchSearch/BatchSearchActions/BatchSearchActions'
import BatchSearchCardDetails from '@/components/BatchSearch/BatchSeachCard/BatchSearchCardDetails'
import TextTruncate from '@/components/Text/TextTruncate'

defineProps({
  batchSearch: { 
    type: Object, 
    required: true 
  }
})

const { t } = useI18n()

const descriptionLabel = t('batchSearchCardDetails.description')

function deleteBatchSearch(uuid) {
  console.log('deleteBatchSearch', uuid)
}

function relaunchBatchSearch(uuid) {
  console.log('relaunchBatchSearch', uuid)
}

function editBatchSearch(uuid) {
  console.log('editBatchSearch', uuid)
}
</script>

<template>
  <card-panel class="batch-search-card" content-class="gap-2" :title="batchSearch.name" no-x-icon>
    <text-truncate
      v-if="batchSearch.description"
      class="text-secondary-emphasis"
      :text="batchSearch.description"
      :aria-label="descriptionLabel"
    />
    <batch-search-actions
      :uuid="batchSearch.uuid"
      @edit="editBatchSearch"
      @relaunch="relaunchBatchSearch"
      @delete="deleteBatchSearch"
    />
    <batch-search-card-details
      :uuid="batchSearch.uuid"
      :name="batchSearch.name"
      :nb-results="batchSearch.nbResults"
      :nb-queries-without-results="batchSearch.nbQueriesWithoutResults"
      :nb-queries="batchSearch.nbQueries"
      :state="batchSearch.state"
      :date="batchSearch.date"
      :author="batchSearch.user.id"
      :visibility="batchSearch.published"
      :phrase-match="batchSearch.phraseMatches"
      :proximity="batchSearch.fuzziness"
      :fuzziness="batchSearch.fuzziness"
      :projects="batchSearch.projects"
      :description="batchSearch.description"
    />
  </card-panel>
</template>
