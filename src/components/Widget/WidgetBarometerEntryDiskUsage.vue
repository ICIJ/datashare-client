<template>
  <widget-barometer-entry class="widget-barometer-entry-disk-usage" :icon="icon" :label="label" :to="to">{{
    value
  }}</widget-barometer-entry>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import WidgetBarometerEntry from '@/components/Widget/WidgetBarometerEntry'
import humanSize from '@/utils/humanSize'
const props = defineProps({
  size: { type: Number, default: null }
})
const { t } = useI18n()
const icon = 'floppy-disk'
const to = `#`
const label = t('widget.diskUsage.details')
const value = humanSize(props.size)
</script>
