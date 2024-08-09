<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
defineOptions({ name: 'LineActionButton' })
defineProps({
  icon: { type: String },
  label: { type: String }
})
</script>

<template>
  <button-icon :icon-left="icon" size="sm" variant="outline-secondary"
    ><slot>{{ label }}</slot></button-icon
  >
</template>

<style scoped lang="scss"></style>
