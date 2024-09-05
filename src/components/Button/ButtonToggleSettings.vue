<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

const active = defineModel('active', { type: Boolean })

defineProps({
  loading: {
    type: Boolean
  }
})

const toggle = () => {
  active.value = !active.value
}
</script>

<template>
  <button-icon
    :label="$t('buttonToggleSettings.label')"
    class="button-toggle-settings border-0"
    hide-label
    icon-left="sliders-horizontal"
    square
    variant="outline-secondary"
    @click="toggle"
  />
</template>
