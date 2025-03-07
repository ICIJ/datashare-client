<script setup>
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
import { useConfirmModal } from '@/composables/confirm'
defineProps({
  disabled: { type: Boolean }
})
const emit = defineEmits(['relaunch'])
const { confirm: showConfirmModal } = useConfirmModal()

async function onRelaunch() {
  if (await showConfirmModal()) {
    emit('relaunch')
  }
}
</script>

<template>
  <button-row-action icon="copy" :disabled="disabled" :label="$t('buttonRowAction.relaunch')" @click="onRelaunch" />
</template>
