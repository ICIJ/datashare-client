<template>
  <div class="page-settings">
    <div class="d-flex justify-content-between align-items-baseline">
      <page-settings-title class="pb-4">{{ title }}</page-settings-title>
      <slot name="closeButton"> </slot>
    </div>
    <slot> </slot>
  </div>
</template>

<script setup>
import PageSettingsTitle from '@/components/PageSettings/PageSettingsTitle'

defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>
