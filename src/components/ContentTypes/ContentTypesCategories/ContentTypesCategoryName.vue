<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhCaretRight from '~icons/ph/caret-right'
import IPhCaretDown from '~icons/ph/caret-down'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { useContentTypeCategoryLabel } from '@/composables/useContentTypeCategoryLabel'

const modelValue = defineModel({ type: Boolean, default: false })
const collapse = defineModel('collapse', { type: Boolean, default: true })

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  indeterminate: {
    type: Boolean
  }
})

const { t } = useI18n()
const categoryLabel = useContentTypeCategoryLabel()
const resolvedLabel = computed(() => categoryLabel(props.category))
const collapseIcon = computed(() => (collapse.value ? IPhCaretRight : IPhCaretDown))
</script>

<template>
  <div class="content-types-category-name d-flex align-items-center">
    <button-icon
      class="content-types-category-name__toggler"
      variant="link"
      size="sm"
      :icon-left="collapseIcon"
      icon-left-weight="bold"
      :label="t('filtersPanelSectionFilterTitleToggler.toggle')"
      hide-label
      hide-tooltip
      @click="collapse = !collapse"
    />
    <filters-panel-section-filter-entry
      v-model="modelValue"
      class="content-types-category-name__entry flex-grow-1"
      :label="resolvedLabel"
      :count="count"
      :indeterminate="indeterminate"
    />
  </div>
</template>

<style lang="scss" scoped>
.content-types-category-name {
  &__entry {
    min-width: 0;
  }
}
</style>
