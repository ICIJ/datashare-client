<script setup>
import { useMode } from '@/composables/mode'

const { isServer: isVisible } = useMode()
</script>

<template>
  <slot v-if="isVisible" />
</template>
