<script setup>
import ButtonToggleSidebar from '@/components/Button/ButtonToggleSidebar'

const active = defineModel('active', { type: Boolean })
</script>

<template>
  <button-toggle-sidebar v-model:active="active" />
</template>
