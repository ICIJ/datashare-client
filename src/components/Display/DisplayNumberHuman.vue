<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import humanNumber from '@/utils/humanNumber'

const props = defineProps({
  value: {
    type: Number
  }
})

const { tm } = useI18n()

const humanValue = computed(() => {
  return humanNumber(props.value, tm('human.number'))
})
</script>

<template>
  {{ humanValue }}
</template>
