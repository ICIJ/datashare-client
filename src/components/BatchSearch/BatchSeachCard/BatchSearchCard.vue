<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import CardPanel from '@/components/CardPanel/CardPanel'
import BatchSearchActions from '@/components/BatchSearch/BatchSearchActions/BatchSearchActions'
import BatchSearchCardDetails from '@/components/BatchSearch/BatchSeachCard/BatchSearchCardDetails'
import TextTruncate from '@/components/Text/TextTruncate'
import { useAuth } from '@/composables/useAuth'

const { batchSearch } = defineProps({
  batchSearch: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const { username } = useAuth()
const canManageBatchSearch = computed(() => batchSearch.user.id === username.value)
</script>

<template>
  <card-panel
    border
    class="batch-search-card"
    body-class="p-4 gap-3"
    content-class="batch-search-card__content gap-3"
    title-class="batch-search-card__title"
    :title="batchSearch.name"
    no-x-icon
  >
    <text-truncate
      v-if="batchSearch.description"
      class="batch-search-card__content__description text-secondary-emphasis"
      :text="batchSearch.description"
      :aria-label="t('batchSearchCardDetails.description')"
    />
    <batch-search-actions
      v-if="canManageBatchSearch"
      :batch-search="batchSearch"
    />
    <batch-search-card-details :batch-search="batchSearch" />
  </card-panel>
</template>

<style lang="scss" scoped>
.batch-search-card {
  &:deep(.batch-search-card__title) {
    padding: $spacer-xxs 0;
  }
}
</style>
