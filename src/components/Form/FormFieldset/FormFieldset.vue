<script setup>
import { computed, useTemplateRef, toRef } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import { VARIANT_PLAIN, variantValidator } from '@/enums/variants'
import { useCompact } from '@/composables/useCompact'

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
  descriptionClass: {
    type: [String, Array, Object]
  },
  required: {
    type: Boolean
  },
  compactThreshold: {
    type: Number,
    default: 990
  },
  withDescription: {
    type: Boolean
  },
  labelVisuallyHidden: {
    type: Boolean
  },
  validated: {
    type: Boolean,
    default: false
  }
})

const elementRef = useTemplateRef('element')
const { compact } = useCompact(elementRef, { threshold: toRef(props, 'compactThreshold') })

const classList = computed(() => {
  return {
    'form-fieldset--required': props.required,
    'was-validated': props.validated
  }
})

const labelColsSm = computed(() => {
  return props.labelVisuallyHidden ? null : props.labelColsSm
})
const labelColsMd = computed(() => {
  return props.labelVisuallyHidden ? null : props.labelColsMd
})
const labelColsLg = computed(() => {
  return props.labelVisuallyHidden ? null : props.labelColsLg
})
</script>

<template>
  <b-form-group
    ref="element"
    class="form-fieldset container-fluid"
    :class="classList"
    :label-cols-sm="labelColsSm"
    :label-cols-md="labelColsMd"
    :label-cols-lg="labelColsLg"
    :label="label"
    :label-for="labelFor"
    :description="compact ? description : null"
    :label-visually-hidden="labelVisuallyHidden"
    :validated="validated"
  >
    <template #label>
      <div class="form-fieldset__label text-body-emphasis">
        <phosphor-icon
          v-if="icon"
          :name="icon"
          :variant="iconVariant"
          class="me-2"
        />
        <slot
          name="label"
          v-bind="{ labelFor }"
        >
          {{ label }}
        </slot>
      </div>
    </template>
    <template v-if="!compact && (withDescription || description)">
      <div class="d-flex align-items-start gap-3">
        <div class="form-fieldset__content">
          <slot v-bind="{ compact }" />
        </div>
        <div
          class="form-fieldset__description text-secondary-emphasis"
          :class="descriptionClass"
        >
          {{ description }}
        </div>
      </div>
    </template>
    <template v-else>
      <div class="gap-3">
        <slot v-bind="{ compact }" />
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
    flex: 300px 0 0;
  }

  &__description {
    padding-block: calc(0.75em + var(--bs-border-width));
  }

  .form-text {
    display: block;
    padding-top: $spacer-xs;
    margin: 0;
  }
}
</style>
