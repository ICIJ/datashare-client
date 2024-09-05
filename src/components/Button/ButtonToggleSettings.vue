<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  label: {
    type: String
  },
  active: {
    type: Boolean
  }
})
</script>

<template>
  <button-icon
    :label="label ?? $t('buttonSettings.label')"
    class="button-toggle-settings border-0"
    hide-label
    icon-left="sliders-horizontal"
    square
    :variant="variant"
  />
</template>
