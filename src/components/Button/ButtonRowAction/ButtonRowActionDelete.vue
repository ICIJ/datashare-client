<script setup>
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
import { useConfirmModal } from '@/composables/confirm'
defineProps({
  disabled: { type: Boolean }
})
const emit = defineEmits(['delete'])
const { confirm: showConfirmModal } = useConfirmModal()

async function onDelete() {
  if (await showConfirmModal()) {
    emit('delete')
  }
}
</script>

<template>
  <button-row-action icon="trash" :disabled="disabled" :label="$t('buttonRowAction.delete')" @click="onDelete" />
</template>
