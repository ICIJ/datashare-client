<script setup>
import { computed } from 'vue'
import { EllipsisTooltip as vEllipsisTooltip } from '@icij/murmur-next'

const props = defineProps({
  label: {
    type: String
  },
  modelValue: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const classList = computed(() => {
  return {
    'filters-panel-section-filter-entry--checked': props.modelValue
  }
})
</script>

<template>
  <div class="filters-panel-section-filter-entry" :class="classList">
    <b-form-checkbox :model-value="modelValue" @update:modelValue="emit('update:modelValue', $event)">
      <slot>
        <span v-ellipsis-tooltip="{ title: label, placement: 'right', offset: '0px' }" class="text-truncate">
          {{ label }}
        </span>
      </slot>
    </b-form-checkbox>
    <b-badge class="filters-panel-section-filter-entry__count" pill variant="link">
      {{ $n(count) }}
    </b-badge>
  </div>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter-entry {
  display: flex;
  align-items: center;

  &:deep(.form-check) {
    display: flex;
    min-width: 0;

    .form-check-input {
      margin-right: $spacer-xs;
    }

    .form-check-label {
      max-width: 100%;

      .text-truncate {
        display: block;
        width: 100%;
      }
    }
  }

  &__count {
    margin-left: auto;
    color: var(--bs-body-bg);
    background: var(--bs-secondary);
  }

  &--checked {
    .filters-panel-section-filter-entry__count {
      background: var(--bs-action-text-emphasis);
    }
  }
}
</style>
