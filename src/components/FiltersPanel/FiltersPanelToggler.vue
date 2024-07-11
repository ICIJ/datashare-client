<script setup>
import IconButton from '@/components/IconButton.vue'

const emit = defineEmits(['close'])
</script>

<template>
  <icon-button class="filters-panel-toggler" variant="outline-dark" icon-left="x" @click="emit('close')">
    <slot>Close filters</slot>
  </icon-button>
</template>
