<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: [String, Number, Boolean]
  }
})

const isTruthy = computed(() => {
  const value = String(props.value).toLowerCase()
  return ['y', 'yes', 't', 'true'].includes(value) || props.value > 0
})
</script>

<template>
  {{ isTruthy ? $t('displayBoolean.yes') : $t('displayBoolean.no') }}
</template>
