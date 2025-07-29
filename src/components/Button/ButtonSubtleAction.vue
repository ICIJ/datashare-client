<script setup>
import { ButtonIcon } from '@icij/murmur-next'

defineProps({
  hideLabel: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <button-icon
    variant="link"
    class="bg-action-subtle text-action-emphasis-subtle p-1"
    :hide-label="hideLabel"
  />
</template>
