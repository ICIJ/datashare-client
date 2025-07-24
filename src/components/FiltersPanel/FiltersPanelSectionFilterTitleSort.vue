<script setup>
import { computed, ref } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import settings from '@/utils/settings'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ sortBy: '_count', orderBy: 'desc' })
  },
  sortByOptions: {
    type: Array,
    default: () => settings.filter.sortByOptions
  },
  teleportTo: {
    type: String,
    default: '.filters-panel'
  }
})

const { t } = useI18n()

const emit = defineEmits(['update:modelValue'])
const showDropdown = ref(false)

const sortByOptionsWithLabels = computed(() => {
  return props.sortByOptions.map(({ sortBy, orderBy }) => {
    const label = `filter.sortByDropdown.options.${sortBy}.${orderBy}`
    return { label, sortBy, orderBy }
  })
})

const applySort = ({ sortBy, orderBy }) => {
  if (sortBy !== props.modelValue.sortBy || orderBy !== props.modelValue.orderBy) {
    emit('update:modelValue', { sortBy, orderBy })
  }
}

const isOptionActive = ({ sortBy, orderBy }) => {
  return props.modelValue.sortBy === sortBy && props.modelValue.orderBy === orderBy
}
</script>

<template>
  <b-dropdown
    v-model="showDropdown"
    :teleport-to="teleportTo"
    class="filters-panel-section-filter-title-sort"
    variant="link"
    end
    toggle-class="bg-action-subtle p-1"
    no-caret
  >
    <template #button-content>
      <phosphor-icon :name="PhSortAscending" height="1em" />
      <span class="visually-hidden">Sort</span>
    </template>
    <b-dropdown-item
      v-for="(option, i) in sortByOptionsWithLabels"
      :key="i"
      :active="isOptionActive(option)"
      @click="applySort(option)"
    >
      {{ t(option.label) }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter-title-sort {
  &:deep(.dropdown-toggle) {
    padding: 0 $spacer-xs;
    line-height: 1;
    display: inline-flex;
    align-items: center;
  }
}
</style>
