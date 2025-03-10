<script setup>
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

const { withModal } = defineProps({
  withModal: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button-row-action :icon="PhArrowCounterClockwise" :label="$t('buttonRowAction.relaunch')" />
</template>
