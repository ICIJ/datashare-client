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
  descriptionKey: {
    type: String
  },
  forceCompact: {
    type: Boolean
  }
})

const { te, t } = useI18n()
const id = uniqueId(props.name)
const labelFor = `input-${props.name}`
const descriptionKey = props.descriptionKey ?? `${props.translationKey}.description`
const description = computed(() => (te(descriptionKey) ? t(descriptionKey) : null))
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
    :compact-threshold="forceCompact ? 10000 : 0"
  >
    <slot v-bind="{ name: labelFor, ...slotProps }" />
  </form-fieldset>
</template>
