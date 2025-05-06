<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import FiltersPanelSectionFilterTitleSort from '@/components/FiltersPanel/FiltersPanelSectionFilterTitleSort'

const sort = defineModel('sort', { type: Object })

defineProps({
  filter: {
    type: Object,
    required: true
  }
})
const { t } = useI18n()
</script>

<template>
  <div class="d-flex align-items-center text-start">
    <span class="flex-grow-1 text-truncate">
      <phosphor-icon :name="filter.icon" class="me-2" />
      {{ t(`filter.${filter.name}`) }}
    </span>
    <filters-panel-section-filter-title-sort v-if="!filter.hideSort" v-model="sort" :teleport-to="null" />
  </div>
</template>
