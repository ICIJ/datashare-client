<script setup>
import { computed } from 'vue'
import { EllipsisTooltip as vEllipsisTooltip } from '@icij/murmur-next'

import DisplayNumber from '@/components/Display/DisplayNumber'

const modelValue = defineModel({
  type: Boolean,
  default: null
})

const props = defineProps({
  label: {
    type: String
  },
  count: {
    type: Number,
    default: 0
  },
  value: {
    type: [String, Number, Date, Boolean],
    default: true
  },
  disabled: {
    type: Boolean
  },
  hideCount: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'filters-panel-section-filter-entry--checked': modelValue.value
  }
})

const showCount = computed(() => !props.hideCount && !isNaN(props.count))
</script>

<template>
  <div
    class="filters-panel-section-filter-entry"
    :class="classList"
  >
    <b-form-checkbox
      v-model="modelValue"
      :value="value"
      :disabled="disabled"
    >
      <slot v-bind="{ label }">
        <span
          v-ellipsis-tooltip="{ title: label, placement: 'right', offset: 8, teleportTo: 'body' }"
          class="filters-panel-section-filter-entry__label text-truncate"
        >
          {{ label }}
        </span>
      </slot>
    </b-form-checkbox>
    <b-badge
      v-if="showCount"
      class="filters-panel-section-filter-entry__count"
      pill
      variant="link"
    >
      <slot
        name="count"
        v-bind="{ count }"
      >
        <display-number :value="Number(count)" />
      </slot>
    </b-badge>
  </div>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter-entry {
  display: flex;
  align-items: center;
  margin-bottom: $spacer-xxs;

  &:deep(.form-check) {
    display: flex;
    min-width: 0;
    margin-right: $spacer-xs;
    margin-bottom: 0;

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

  &--checked,
  &:has(.form-check-input:checked) {
    .filters-panel-section-filter-entry__count {
      background: var(--bs-action-text-emphasis);
    }
  }
}
</style>
