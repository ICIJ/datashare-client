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
    :label="label ?? $t('buttonSettings.label')"
    class="button-add border-0"
    hide-label
    icon-left="sliders-horizontal"
    square
    variant="outline-secondary"
  />
</template>
