<script setup>
import { useI18n } from 'vue-i18n'

import CardPanel from '@/components/CardPanel/CardPanel'
import BatchSearchCardActions from '@/components/BatchSearch/BatchSearchCardActions'
import BatchSearchCardDetails from '@/components/BatchSearch/BatchSearchCardDetails'
import TextTruncate from '@/components/Text/TextTruncate'
defineOptions({ name: 'BatchSearchDetails' })
defineProps({
  batchSearch: { type: Object, required: true }
})

const { t } = useI18n()

const descriptionLabel = t('batchSearchCardDetails.description')
</script>

<template>
  <card-panel class="batch-search-card" content-class="gap-2" :title="batchSearch.name" no-x-icon>
    <text-truncate class="text-secondary-emphasis" :text="batchSearch.description" :aria-label="descriptionLabel" />
    <batch-search-card-actions
      :uuid="batchSearch.uuid"
      :nb-results="batchSearch.nbResults"
      projects="batchSearch.projects"
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
