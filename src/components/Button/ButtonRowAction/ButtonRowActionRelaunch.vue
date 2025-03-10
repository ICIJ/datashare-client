<script setup>
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
import { useConfirmModal } from '@/composables/confirm'

const { withModal } = defineProps({
  withModal: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete'])
const { confirm: showConfirmModal } = useConfirmModal()

async function onRelaunch() {
  if (withModal === true) {
    if (await showConfirmModal()) {
      emit('relaunch')
    }
  } else {
    emit('relaunch')
  }
}
</script>

<template>
  <button-row-action
    icon="arrow-counter-clockwise"
    :disabled="disabled"
    :label="$t('buttonRowAction.relaunch')"
    @click="onRelaunch"
  />
</template>
