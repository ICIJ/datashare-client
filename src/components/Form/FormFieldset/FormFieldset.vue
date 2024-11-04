<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import { VARIANT_PLAIN, variantValidator } from '@/enums/variants'
import { useBreakpoints } from '@/composables/breakpoints'
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'

const props = defineProps({
  label: {
    type: String
  },
  icon: {
    type: [String, Object, Array]
  },
  iconVariant: {
    type: String,
    default: VARIANT_PLAIN.TERTIARY,
    validator: variantValidator
  },
  labelColsSm: {
    type: Number,
    default: 12
  },
  labelColsMd: {
    type: Number,
    default: 4
  },
  labelColsLg: {
    type: Number,
    default: 3
  },
  labelFor: {
    type: String
  },
  compact: { type: Boolean, default: false },
  description: { type: String },
  required: {
    type: Boolean
  },
  compactAuto: {
    type: Boolean,
    default: false
  },
  compactAutoBreakpoint: {
    type: String,
    default: SIZE.LG,
    validator: breakpointSizeValidator
  },
  noDescription: {
    type: Boolean,
    default: false
  }
})
const { breakpointDown } = useBreakpoints()

const isCompact = computed(() => {
  // If compactAuto is true, use the compactAutoBreakpoint value to determine if the
  // form actions should be compact. This is done through the reactive breakpointDown value.
  // Alternatively, if compactAuto is false, use the compact prop value.
  return (props.compactAuto && breakpointDown.value[props.compactAutoBreakpoint]) || props.compact
})
const classList = computed(() => {
  return {
    'form-fieldset--required': props.required
  }
})
</script>

<template>
  <b-form-group
    class="form-fieldset"
    :class="classList"
    :label-cols-sm="labelColsSm"
    :label-cols-md="labelColsMd"
    :label-cols-lg="labelColsLg"
    :label="label"
    :label-for="labelFor"
    :description="isCompact ? description : null"
  >
    <template #label>
      <div class="form-fieldset__label text-body-emphasis">
        <phosphor-icon v-if="icon" :name="icon" :variant="iconVariant" class="me-2" />
        <slot name="label" v-bind="{ labelFor }">
          {{ label }}
        </slot>
      </div>
    </template>
    <template v-if="!isCompact && !noDescription">
      <div class="col-4 form-fieldset__content">
        <slot v-bind="{ isCompact }" />
      </div>
      <span class="form-fieldset__description-side text-secondary-emphasis">{{ description }}</span>
    </template>
    <template v-else>
      <slot v-bind="{ isCompact }" />
    </template>
  </b-form-group>
</template>

<style lang="scss">
.form-fieldset {
  margin-bottom: $spacer;

  &--required &__label:after {
    content: ' *';
  }
  & .col:has(.form-fieldset__description-side) {
    display: flex;
    gap: 1em;
    align-items: center;
  }
  & .col:has(small) > div {
    margin-bottom: $spacer-xxs;
  }
}
</style>
