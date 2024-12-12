<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

const contextualize = defineModel('contextualize', { type: Boolean })
const exclude = defineModel('exclude', { type: Boolean })
const expand = defineModel('expand', { type: Boolean })

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
  sort: {
    type: Object
  }
})

const isEmpty = computed(() => {
  return props.hideContextualize && props.hideExclude && props.hideExpand
})

const classList = computed(() => {
  return {
    'filters-panel-section-filter-actions--empty': isEmpty.value,
    'filters-panel-section-filter-actions--hide-contextualize': props.hideContextualize,
    'filters-panel-section-filter-actions--hide-exclude': props.hideExclude,
    'filters-panel-section-filter-actions--hide-expand': props.hideShowMore
  }
})
</script>

<template>
  <div class="filters-panel-section-filter-actions" :class="classList">
    <span class="d-flex">
      <b-form-checkbox v-if="!hideContextualize" v-model="contextualize">Contextualize</b-form-checkbox>
      <b-form-checkbox v-if="!hideExclude" v-model="exclude">Exclude</b-form-checkbox>
    </span>
    <button-icon
      v-if="!hideExpand"
      variant="link"
      class="bg-action-subtle text-action-emphasis-subtle p-1 ms-auto"
      tooltip-placement="right"
      icon-left="arrows-out-simple"
      hide-label
      label="Expand"
      @click="expand = !expand"
    />
  </div>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: auto;
  &--empty {
    display: none;
  }

  &:deep(.dropdown-toggle),
  &:deep(.form-check) {
    padding: $spacer-xxs 0;
    border: 0;
    margin-bottom: 0;
    color: var(--bs-action-text-emphasis);
  }

  &:deep(.form-check) {
    flex-basis: auto;
    display: flex;
    align-items: center;
    min-width: 0;
    margin-right: $spacer-xs;
  }

  &:deep(.form-check-input) {
    margin: 0;
    margin-right: $spacer-xs;
  }

  &:deep(.form-check-label) {
    margin: 0;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
