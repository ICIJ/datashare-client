<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import { VARIANT_PLAIN, variantValidator } from '@/enums/variants'

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
  required: {
    type: Boolean
  }
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
  >
    <template #label>
      <div class="form-fieldset__label text-secondary-emphasis">
        <phosphor-icon v-if="icon" :name="icon" :variant="iconVariant" class="me-2" />
        <slot name="label" v-bind="{ labelFor }">
          {{ label }}
        </slot>
      </div>
    </template>
    <slot />
  </b-form-group>
</template>

<style lang="scss">
.form-fieldset {
  margin-bottom: $spacer;

  &--required &__label:after {
    content: ' *';
  }
}
</style>
