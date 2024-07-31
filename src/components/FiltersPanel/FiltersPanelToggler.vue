<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

const emit = defineEmits(['close'])
</script>

<template>
  <button-icon class="filters-panel-toggler" variant="outline-dark" icon-left="x" @click="emit('close')">
    <slot>Close filters</slot>
  </button-icon>
</template>
