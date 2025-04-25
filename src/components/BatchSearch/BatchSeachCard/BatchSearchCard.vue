<script setup>
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
</script>

<template>
  <card-panel class="batch-search-card" border content-class="gap-2" :title="batchSearch.name" no-x-icon>
    <text-truncate
      v-if="batchSearch.description"
      class="text-secondary-emphasis"
      :text="batchSearch.description"
      :aria-label="$t('batchSearchCardDetails.description')"
    />
    <batch-search-actions :uuid="batchSearch.uuid" />
    <batch-search-card-details
      :uuid="batchSearch.uuid"
      :name="batchSearch.name"
      :nb-results="batchSearch.nbResults"
      :nb-queries-without-results="batchSearch.nbQueriesWithoutResults"
      :nb-queries="batchSearch.nbQueries"
      :state="batchSearch.state"
      :date="batchSearch.date"
      :author="batchSearch.userId"
      :visibility="batchSearch.published"
      :phrase-match="batchSearch.phraseMatches"
      :proximity="batchSearch.fuzziness"
      :fuzziness="batchSearch.fuzziness"
      :projects="batchSearch.projects"
      :description="batchSearch.description"
      :uri="batchSearch.uri"
    />
  </card-panel>
</template>
