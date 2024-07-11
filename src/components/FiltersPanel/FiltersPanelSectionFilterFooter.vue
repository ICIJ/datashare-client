<script setup>
import { computed } from 'vue'

import IconButton from '@/components/IconButton'
import FiltersPanelSectionFilterFooterSort from '@/components/FiltersPanel/FiltersPanelSectionFilterFooterSort'

const props = defineProps({
  hideContextualize: {
    type: Boolean
  },
  hideExclude: {
    type: Boolean
  },
  hideExpand: {
    type: Boolean
  },
  hideSort: {
    type: Boolean
  },
  sort: {
    type: Object
  },
  contextualize: {
    type: Boolean
  },
  exclude: {
    type: Boolean
  }
})

const emit = defineEmits(['update:contextualize', 'update:exclude', 'update:sort', 'expand'])

const isEmpty = computed(() => {
  return props.hideContextualize && props.hideExclude && props.hideExpand && props.hideSort
})

const classList = computed(() => {
  return {
    'filters-panel-section-filter-footer--empty': isEmpty.value,
    'filters-panel-section-filter-footer--hide-contextualize': props.hideContextualize,
    'filters-panel-section-filter-footer--hide-exclude': props.hideExclude,
    'filters-panel-section-filter-footer--hide-expand': props.hideShowMore,
    'filters-panel-section-filter-footer--hide-sort': props.hideSort
  }
})
</script>

<template>
  <div class="filters-panel-section-filter-footer" :class="classList">
    <div class="row g-0">
      <div v-if="!hideExpand" class="col">
        <icon-button icon-left="arrows-out-simple" label="Expand" @click="emit('expand')" />
      </div>
      <div v-if="!hideSort" class="col d-flex justify-content-end">
        <filters-panel-section-filter-footer-sort @update:modelValue="emit('update:sort', $event)" />
      </div>
    </div>
    <div class="row g-0">
      <div v-if="!hideContextualize" class="col">
        <b-form-checkbox :model-value="contextualize" @update:modelValue="emit('update:contextualize', $event)">
          Contextualize
        </b-form-checkbox>
      </div>
      <div v-if="!hideExclude" class="col d-flex justify-content-end">
        <b-form-checkbox :model-value="exclude" @update:modelValue="emit('update:exclude', $event)">
          Exclude
        </b-form-checkbox>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter-footer {
  padding: $spacer-xxs 0;
  padding-left: $spacer-xs;

  &--empty {
    display: none;
  }

  &:deep(.icon-button),
  &:deep(.dropdown-toggle),
  &:deep(.form-check) {
    padding: $spacer-xxs 0;
    border: 0;
    margin-bottom: 0;
  }

  &:deep(.form-check) {
    display: flex;
    align-items: center;
  }

  &:deep(.form-check-input) {
    margin: 0;
    margin-right: $spacer-xs;
  }

  &:deep(.form-check-label) {
    margin: 0;
  }
}
</style>
