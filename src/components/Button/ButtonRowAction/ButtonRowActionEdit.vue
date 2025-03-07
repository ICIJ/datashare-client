<script setup>
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
defineProps({
  disabled: { type: Boolean }
})
</script>

<template>
  <button-row-action
    icon="pencil-simple"
    :disabled="disabled"
    :label="$t('buttonRowAction.edit')"
    @click="$emit('edit')"
  />
</template>
