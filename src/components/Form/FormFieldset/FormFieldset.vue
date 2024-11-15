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
  description: {
    type: String
  },
  required: {
    type: Boolean
  },
  compact: {
    type: Boolean
  },
  compactAuto: {
    type: Boolean,
    default: true
  },
  compactAutoBreakpoint: {
    type: String,
    default: SIZE.LG,
    validator: breakpointSizeValidator
  },
  withDescription: {
    type: Boolean
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
    class="form-fieldset container-fluid"
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
    <template v-if="!isCompact && (withDescription || description)">
      <div class="d-flex align-items-center gap-3">
        <div class="form-fieldset__content">
          <slot v-bind="{ isCompact }" />
        </div>
        <div class="form-fieldset__description-side text-secondary-emphasis">
          {{ description }}
        </div>
      </div>
    </template>
    <template v-else>
      <div class="row">
        <slot v-bind="{ isCompact }" />
      </div>
    </template>
  </b-form-group>
</template>

<style lang="scss">
.form-fieldset {
  margin-bottom: $spacer;

  &--required &__label:after {
    content: ' *';
  }

  &__content {
    flex: 280px 0 0;
  }

  .form-text {
    display: block;
    padding-top: $spacer-xs;
    margin: 0;
  }
}
</style>
