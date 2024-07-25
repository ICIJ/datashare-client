<script setup>
import { ref, computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import settings from '@/utils/settings'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ sortBy: '_count', sortByOrder: 'desc' })
  },
  sortByOptions: {
    type: Array,
    default: () => settings.filter.sortByOptions
  }
})

const emit = defineEmits(['update:modelValue'])
const showDropdown = ref(false)

const sortByOptionsWithLabels = computed(() => {
  return props.sortByOptions.map(({ sortBy, sortByOrder }) => {
    const label = `filter.sortByDropdown.options.${sortBy}.${sortByOrder}`
    return { label, sortBy, sortByOrder }
  })
})

const applySort = ({ sortBy, sortByOrder }) => {
  if (sortBy !== props.modelValue.sortBy || sortByOrder !== props.modelValue.sortByOrder) {
    emit('update:modelValue', { sortBy, sortByOrder })
  }
}

const isOptionActive = ({ sortBy, sortByOrder }) => {
  return props.modelValue.sortBy === sortBy && props.modelValue.sortByOrder === sortByOrder
}
</script>

<template>
  <b-dropdown
    v-model="showDropdown"
    class="filters-panel-section-filter-title-sort"
    variant="link"
    end
    teleport-to="body"
    toggle-class="bg-action-subtle p-1"
    no-caret
  >
    <template #button-content>
      <phosphor-icon name="sort-ascending" height="1em" />
      <span class="visually-hidden">Sort</span>
    </template>
    <b-dropdown-item
      v-for="(option, i) in sortByOptionsWithLabels"
      :key="i"
      :active="isOptionActive(option)"
      @click="applySort(option)"
    >
      {{ $t(option.label) }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter-title-sort {
  &:deep(.dropdown-toggle) {
    padding: 0 $spacer-xs;
    margin-right: $spacer-xs;
    line-height: 1;
    display: inline-flex;
    align-items: center;
  }
}
</style>
