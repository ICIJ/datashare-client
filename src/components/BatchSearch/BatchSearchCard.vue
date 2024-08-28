<script setup>
import { useI18n } from 'vue-i18n'

import CardPanel from '@/components/Card/CardPanel'
import BatchSearchCardActions from '@/components/BatchSearch/BatchSearchCardActions'
import BatchSearchCardDetails from '@/components/BatchSearch/BatchSearchCardDetails'
import TextTruncate from '@/components/BatchSearch/TextTruncate'
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
      :projects="batchSearch.projects"
    />

    <batch-search-card-details v-bind="batchSearch" />
  </card-panel>
</template>
