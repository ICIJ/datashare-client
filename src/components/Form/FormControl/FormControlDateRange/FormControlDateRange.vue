<script setup>
import { computed, useTemplateRef } from 'vue'
import { DatePicker } from 'v-calendar'
import { PhosphorIcon } from '@icij/murmur-next'

import { inputSizeValidator, SIZE } from '@/enums/sizes'
import { useColorMode } from '@/composables/color-mode'

const modelValue = defineModel({ type: [Object, Array], default: () => ({ start: null, end: null }) })

defineProps({
  size: {
    type: String,
    default: SIZE.MD,
    validator: inputSizeValidator
  },
  masks: {
    type: String,
    default: 'MM/DD/YYYY'
  },
  transition: {
    type: String,
    default: 'fade'
  },
  timezone: {
    type: String,
    default: 'utc'
  },
  color: {
    type: String,
    default: 'action'
  },
  updateOnInput: {
    type: Boolean,
    default: false
  },
  /**
   * Attributes are visual decorators that can be applied to specific calendar dates.
   */
  attributes: {
    type: Array,
    default: () => [{ key: 'today', highlight: 'primary', dates: new Date() }]
  },
  popover: {
    type: Object,
    default: () => ({ visibility: 'focus' })
  }
})

const element = useTemplateRef('element')
const { colorMode } = useColorMode(element)
const isDark = computed(() => ['dark', 'black'].includes(colorMode.value))
</script>

<template>
  <div ref="element" class="form-control-date-range">
    <date-picker
      v-model.range="modelValue"
      :locale="$i18n.locale"
      :color="color"
      :attributes="attributes"
      :transition="transition"
      :timezone="timezone"
      :is-dark="isDark"
      :update-on-input="updateOnInput"
      :popover="popover"
    >
      <template #default="{ inputValue, inputEvents }">
        <slot v-bind="{ inputValue, inputEvents, masks, size }">
          <div class="d-flex gap-3 align-items-center">
            <b-form-input :placeholder="masks" :value="inputValue.start" :size="size" v-on="inputEvents.start" />
            <phosphor-icon name="arrow-right" />
            <b-form-input :placeholder="masks" :value="inputValue.end" :size="size" v-on="inputEvents.end" />
          </div>
        </slot>
      </template>
    </date-picker>
  </div>
</template>

<style lang="scss" scoped>
.form-control-date-range {
  $colors: map-remove($theme-colors, 'light', 'dark');

  @each $color, $value in $colors {
    &:deep(.vc-#{$color}) {
      --vc-accent-50: #{tint-color($value, 60)};
      --vc-accent-100: #{tint-color($value, 50)};
      --vc-accent-200: #{tint-color($value, 40)};
      --vc-accent-300: #{tint-color($value, 30)};
      --vc-accent-400: #{tint-color($value, 20)};
      --vc-accent-500: #{tint-color($value, 10)};
      --vc-accent-600: #{$value};
      --vc-accent-700: #{shade-color($value, 10)};
      --vc-accent-800: #{shade-color($value, 20)};
      --vc-accent-900: #{shade-color($value, 30)};
    }
  }

  &:deep(.vc-container) {
    --rounded: var(--bs-border-radius);
    --rounded-lg: var(--bs-border-radius-lg);

    --shadow: none;
    --shadow-lg: var(--bs-box-shadow-lg);
    --vc-weekday-color: var(--bs-secondary-text-emphasis);

    &.vc-light.vc-attr,
    &.vc-light .vc-attr,
    &.vc-dark.vc-attr,
    &.vc-dark .vc-attr {
      --vc-highlight-light-content-color: var(--bs-body-color);
    }

    font-family: var(--bs-body-font-family);
    color: var(--bs-body-color);
    background-color: var(--bs-body-bg);
    border-color: var(--bs-border-color);
  }

  &:deep(.vc-container .vc-highlight-bg-light),
  &:deep(.vc-container .vc-highlight-bg-dark) {
    background-color: var(--bs-secondary-bg-subtle) !important;
  }
}
</style>
