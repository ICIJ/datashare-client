<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { toVariant } from '@/utils/utils'

const { t } = useI18n()

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

const valueTitle = computed(() => {
  return props.title ?? t(`displayStatus.${valueVariant.value}`)
})
</script>

<template>
  {{ valueTitle }}
</template>