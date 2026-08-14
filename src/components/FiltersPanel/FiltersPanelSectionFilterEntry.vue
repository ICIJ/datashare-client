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

// Show the lock button when the value is ticked OR already locked: a value
// can be locked while unticked (e.g. after "Clear filters", which preserves
// locks but unticks the value), and the user still needs a way to unlock it.
const showLockButton = computed(() => Boolean(props.modelValue) || props.locked)
const showCount = computed(() => !props.hideCount && !isNaN(props.count) && !showLockButton.value)
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
    <button-icon
      v-if="showLockButton"
      square
      hide-label
      variant="link"
      size="sm"
      class="filters-panel-section-filter-entry__lock"
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

  &__lock {
    flex-shrink: 0;
    margin-right: $spacer-xs;
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
