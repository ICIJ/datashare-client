<script setup>
import FiltersPanelSectionTitle from '@/components/FiltersPanelSectionTitle.vue'

defineProps({
  title: {
    type: String
  }
})
</script>

<template>
  <div class="filters-panel-section mb-5">
    <filters-panel-section-title :title="title">
      <slot name="title" />
    </filters-panel-section-title>
    <slot />
  </div>
</template>
