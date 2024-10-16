<script setup>
import { useI18n } from 'vue-i18n'
import uniqueId from 'lodash/uniqueId'
import { computed } from 'vue'

import FormFieldset from '@/components/Form/FormFieldset/FormFieldset'

const props = defineProps({
  name: {
    type: String
  },
  translationKey: {
    type: String
  },
  descriptionSide: { type: Boolean, default: false }
})

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
    :label="t(`${translationKey}.label`)"
    :class="name"
    :label-for="labelFor"
    :description="description"
    :description-side="descriptionSide"
  >
    <slot v-bind="{ name: labelFor, ...slotProps }"></slot>
  </form-fieldset>
</template>
