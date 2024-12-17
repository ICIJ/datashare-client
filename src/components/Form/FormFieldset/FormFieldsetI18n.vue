<script setup>
import { useI18n } from 'vue-i18n'
import uniqueId from 'lodash/uniqueId'
import { computed, useAttrs } from 'vue'

import FormFieldset from '@/components/Form/FormFieldset/FormFieldset'

const props = defineProps({
  name: {
    type: String
  },
  translationKey: {
    type: String
  },
  forceCompact: { type: Boolean }
})
const { required, 'label-visually-hidden': labelVisuallyHidden, 'with-description': withDescription } = useAttrs()
const { te, t } = useI18n()
const id = uniqueId(props.name)
const labelFor = `input-${props.name}`
const description = computed(() =>
  te(`${props.translationKey}.description`) ? t(`${props.translationKey}.description`) : null
)
</script>

<template>
  <form-fieldset
    :id="id"
    v-slot="slotProps"
    form-fieldset
    path
    :label="t(`${translationKey}.label`)"
    :class="name"
    :label-for="labelFor"
    :description="description"
    :compact-threshold="forceCompact ? 10000 : undefined"
    :with-description="withDescription"
    :label-visually-hidden="labelVisuallyHidden"
    :required="required"
  >
    <slot v-bind="{ name: labelFor, ...slotProps }"></slot>
  </form-fieldset>
</template>
