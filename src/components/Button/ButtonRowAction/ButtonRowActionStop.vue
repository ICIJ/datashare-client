<script setup>
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
import { useConfirmModal } from '@/composables/confirm'
defineProps({
  disabled: { type: Boolean }
})
const emit = defineEmits(['stop'])
const { confirm: showConfirmModal } = useConfirmModal()

async function onStop() {
  if (await showConfirmModal()) {
    emit('stop')
  }
}
</script>

<template>
  <button-row-action icon="stop-circle" :disabled="disabled" :label="$t('buttonRowAction.stop')" @click="onStop" />
</template>
