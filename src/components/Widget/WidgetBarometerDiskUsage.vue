<template>
  <widget-barometer class="widget-barometer-disk-usage" :icon="icon" :label="label">
    {{ value }}
  </widget-barometer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import WidgetBarometer from '@/components/Widget/WidgetBarometer'
import humanSize from '@/utils/humanSize'

const props = defineProps({
  size: { type: Number, default: null }
})

const { t } = useI18n()
const icon = 'floppy-disk-back'

const label = computed(() => {
  return t('widget.diskUsage.details')
})

const value = computed(() => {
  return humanSize(props.size)
})
</script>
