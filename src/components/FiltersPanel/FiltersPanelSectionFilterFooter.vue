<script setup>
import { computed } from 'vue'

import IconButton from '@/components/IconButton'

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
  },
  contextualize: {
    type: Boolean
  },
  exclude: {
    type: Boolean
  }
})

const emit = defineEmits(['update:contextualize', 'update:exclude', 'expand'])

const isEmpty = computed(() => {
  return props.hideContextualize && props.hideExclude && props.hideExpand
})

const classList = computed(() => {
  return {
    'filters-panel-section-filter-footer--empty': isEmpty.value,
    'filters-panel-section-filter-footer--hide-contextualize': props.hideContextualize,
    'filters-panel-section-filter-footer--hide-exclude': props.hideExclude,
    'filters-panel-section-filter-footer--hide-expand': props.hideShowMore
  }
})
</script>

<template>
  <div class="filters-panel-section-filter-footer" :class="classList">
    <b-form-checkbox
      v-if="!hideContextualize"
      :model-value="contextualize"
      @update:modelValue="emit('update:contextualize', $event)"
    >
      Contextualize
    </b-form-checkbox>
    <b-form-checkbox v-if="!hideExclude" :model-value="exclude" @update:modelValue="emit('update:exclude', $event)">
      Exclude
    </b-form-checkbox>
    <icon-button
      v-if="!hideExpand"
      variant="link"
      class="bg-primary-subtle text-primary-emphasis-subtle p-1 ms-auto"
      tooltip-placement="right"
      icon-left="arrows-out-simple"
      hide-label
      label="Expand"
      @click="emit('expand')"
    />
  </div>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter-footer {
  padding: $spacer-xxs 0 0;
  display: flex;
  align-items: center;
  overflow: auto;
  width: 100%;
  flex: auto;

  &--empty {
    display: none;
  }

  &:deep(.dropdown-toggle),
  &:deep(.form-check) {
    padding: $spacer-xxs 0;
    border: 0;
    margin-bottom: 0;
    color: var(--bs-primary-text-emphasis);
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
