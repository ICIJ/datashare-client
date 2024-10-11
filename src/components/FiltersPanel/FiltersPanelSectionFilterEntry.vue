<script setup>
import { computed } from 'vue'
import { EllipsisTooltip as vEllipsisTooltip } from '@icij/murmur-next'

const modelValue = defineModel({
  type: Boolean,
  default: false
})

defineProps({
  label: {
    type: String
  },
  count: {
    type: Number,
    default: 0
  }
})

const classList = computed(() => {
  return {
    'filters-panel-section-filter-entry--checked': modelValue.value
  }
})
</script>

<template>
  <div class="filters-panel-section-filter-entry" :class="classList">
    <b-form-checkbox v-model="modelValue">
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
    margin-right: $spacer-xs;
    margin-bottom: $spacer-xxs;

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
