<script setup>
import { computed, nextTick, useTemplateRef } from 'vue'
import { EllipsisTooltip as vEllipsisTooltip, ButtonIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'
import IPhLock from '~icons/ph/lock'
import IPhLockOpen from '~icons/ph/lock-open'

import DisplayNumber from '@/components/Display/DisplayNumber'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: null
  },
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
  },
  indeterminate: {
    type: Boolean
  },
  locked: {
    type: Boolean,
    default: false
  },
  hideLock: {
    type: Boolean
  }
})

const emit = defineEmits(['update:modelValue', 'update:locked'])

const { t } = useI18n()

const checkboxRef = useTemplateRef('checkboxRef')

// Drive the checkbox as a fully controlled component: when the parent absorbs
// the click (e.g. promoting the last child to a category) the prop stays put,
// but Vue's no-op patch leaves the DOM `el.checked` ahead — manually re-sync.
const onUpdateModelValue = async (value) => {
  emit('update:modelValue', value)
  await nextTick()
  const input = checkboxRef.value?.element
  const expected = Boolean(props.modelValue)
  if (input && input.checked !== expected) {
    input.checked = expected
  }
}

const classList = computed(() => {
  return {
    'filters-panel-section-filter-entry--checked': props.modelValue
  }
})

// The lock button's slot is always reserved (visibility handled purely via
// CSS opacity — hidden by default, revealed on hover or when locked) so the
// count pill's position never jitters based on tick/lock state.
const showLockButton = computed(() => !props.hideLock)
const showCount = computed(() => !props.hideCount && !isNaN(props.count))
const lockLabel = computed(() => t(props.locked ? 'filtersPanelSectionFilterEntry.unlock' : 'filtersPanelSectionFilterEntry.lock'))
</script>

<template>
  <div
    class="filters-panel-section-filter-entry"
    :class="classList"
  >
    <b-form-checkbox
      ref="checkboxRef"
      :model-value="props.modelValue"
      :value="value"
      :disabled="disabled"
      :indeterminate="indeterminate"
      @update:model-value="onUpdateModelValue"
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
    <div class="filters-panel-section-filter-entry__end">
      <button-icon
        v-if="showLockButton"
        square
        hide-label
        variant="link"
        size="sm"
        class="filters-panel-section-filter-entry__lock"
        :class="{ 'filters-panel-section-filter-entry__lock--locked': locked }"
        :icon-left="locked ? IPhLock : IPhLockOpen"
        :pressed="locked"
        :label="lockLabel"
        @click="emit('update:locked', !locked)"
      />
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
  </div>
</template>

<style lang="scss" scoped>
.filters-panel-section-filter-entry {
  display: flex;
  align-items: center;
  margin-bottom: $spacer-xxs;

  &:deep(.form-check) {
    display: flex;
    flex: 1 1 auto;
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

  // Lock + count pill, pinned flush to the row's right edge regardless of
  // label length or lock visibility — only the pill's own width (digit
  // count) shifts its left edge.
  &__end {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: $spacer-xs;
    margin-left: auto;
  }

  &__lock {
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.15s ease;

    &--locked {
      opacity: 1;

      // Same accent as the breadcrumb chip's locked lock icon.
      &:deep(.button-icon__icon-left) {
        color: var(--bs-action);
      }
    }
  }

  &:hover &__lock,
  &__lock:focus-visible {
    opacity: 1;
  }

  &__count {
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
