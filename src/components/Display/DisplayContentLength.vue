<script setup>
import { useI18n } from 'vue-i18n'

import humanSize from '@/utils/humanSize'

defineProps({
  value: {
    type: [String, Number]
  }
})
const { tm } = useI18n()
</script>

<template>
  <span>{{ humanSize(value, false, tm('human.size')) }}</span>
</template>
