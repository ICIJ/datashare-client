<script setup>
import ButtonToggleSidebar from '@/components/Button/ButtonToggleSidebar'

const props = defineProps({
  compact: {
    type: Boolean
  }
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <button-toggle-sidebar :compact="props.compact" @toggle="emit('toggle', $event)" />
</template>
