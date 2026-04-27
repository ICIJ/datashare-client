<script setup>
import { computed, nextTick, useTemplateRef } from 'vue'
import { EllipsisTooltip as vEllipsisTooltip } from '@icij/murmur-next'

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
  }
})

const emit = defineEmits(['update:modelValue'])

const checkboxRef = useTemplateRef('checkboxRef')

// Why explicit props+emit instead of `defineModel` (which sibling checkbox
// wrappers like ContentTypesCategoryItem and DocumentCardCheckbox use):
// `defineModel` exposes a writable proxy ref that the inner `v-model` writes
// through *locally* on every click. When the parent decides the click should
// not change the prop (e.g. ticking the last child of a category promotes the
// selection into `contentTypeCategory`, leaving this entry's `modelValue`
// `false` on both sides), the proxy still holds the click's optimistic value
// and the rendered checkbox stays visually checked. Driving the inner
// `<b-form-checkbox>` as a fully controlled component (`:model-value` + manual
// `@update:model-value`) lets us read the canonical `props.modelValue` after
// the parent has handled the emit and force the DOM back in sync — Vue's
// prop diff skips the patch on the no-change path, so `vModelCheckbox`'s
// `beforeUpdate` never re-runs to revert `el.checked` for us.
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

const showCount = computed(() => !props.hideCount && !isNaN(props.count))
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
