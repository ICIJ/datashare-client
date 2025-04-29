<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { camelCase } from 'lodash'

import { toVariant } from '@/utils/utils'

const { t, te } = useI18n()

const props = defineProps({
  value: {
    type: String
  },
  title: {
    type: String
  }
})

const valueVariant = computed(() => {
  return toVariant(props.value)
})

const valueNormalized = computed(() => {
  return camelCase(props.value)
})

const valueTitle = computed(() => {
  if (props.title) {
    return props.title
  }
  if (te(`displayStatus.${valueNormalized.value}`)) {
    return t(`displayStatus.${valueNormalized.value}`)
  }
  return t(`displayStatus.${valueVariant.value}`)
})
</script>

<template>
  <span>{{ valueTitle }}</span>
</template>
