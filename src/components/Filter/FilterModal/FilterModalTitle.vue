<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import FiltersPanelSectionFilterTitleSort from '@/components/FiltersPanel/FiltersPanelSectionFilterTitleSort'
import builtinFilterIcons from '@/store/filters/icons'

const sort = defineModel('sort', { type: Object })

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})
const { t } = useI18n()

const icon = computed(() => props.filter.icon ?? builtinFilterIcons[props.filter.name])
</script>

<template>
  <div class="d-flex align-items-center text-start">
    <span class="flex-grow-1 text-truncate">
      <app-icon
        :name="icon"
        class="me-2"
      />
      {{ t(`filter.${filter.name}`) }}
    </span>
    <filters-panel-section-filter-title-sort
      v-if="!filter.hideSort"
      v-model="sort"
      :teleport-to="null"
    />
  </div>
</template>
