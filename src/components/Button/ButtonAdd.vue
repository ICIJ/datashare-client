<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  label: {
    type: String
  }
})
</script>

<template>
  <button-icon
    :label="label ?? $t('buttonAdd.label')"
    class="button-add"
    hide-label
    icon-left="plus"
    pill
    square
    variant="action"
  />
</template>
