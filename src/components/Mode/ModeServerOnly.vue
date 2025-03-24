<script setup>
import { useMode } from '@/composables/useMode'

const { isServer: isVisible } = useMode()
</script>

<template>
  <slot v-if="isVisible" />
</template>
