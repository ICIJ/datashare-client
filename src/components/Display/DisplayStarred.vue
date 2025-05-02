<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  value: {
    type: [String, Number, Boolean]
  }
})
const { t } = useI18n()

const isTruthy = computed(() => {
  const value = String(props.value).toLowerCase()
  return ['y', 'yes', 't', 'true'].includes(value) || props.value > 0
})
</script>

<template>
  <span>{{ isTruthy ? t('displayStarred.yes') : t('displayStarred.no') }}</span>
</template>
