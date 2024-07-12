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
    <div class="d-flex justify-content-end">
      <div v-if="!hideExpand" class="me-auto">
        <icon-button
          tooltip-placement="right"
          icon-left="arrows-out-simple"
          hide-label
          label="Expand"
          @click="emit('expand')"
        />
      </div>
      <div v-if="!hideContextualize" class="me-2">
        <b-form-checkbox :model-value="contextualize" @update:modelValue="emit('update:contextualize', $event)">
          Contextualize
        </b-form-checkbox>
      </div>
      <div v-if="!hideExclude" class="d-flex justify-content-end">
        <b-form-checkbox :model-value="exclude" @update:modelValue="emit('update:exclude', $event)">
          Exclude
        </b-form-checkbox>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter-footer {
  padding: 0;

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
