<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { ES_DISTRIBUTION } from '@/enums/esDistributions'

defineOptions({ name: 'DisplayEsDistribution' })

const props = defineProps({
  value: {
    type: String,
    default: ES_DISTRIBUTION.ELASTICSEARCH
  }
})

const { t } = useI18n()

const label = computed(() => {
  return t(`display.esDistribution.${props.value}`, props.value)
})
</script>

<template>
  <span class="display-es-distribution">
    {{ label }}
  </span>
</template>
