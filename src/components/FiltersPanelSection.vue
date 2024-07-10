<script setup>
import FiltersPanelSectionTitle from '@/components/FiltersPanelSectionTitle.vue'

defineProps({
  title: {
    type: String
  }
})
</script>

<template>
  <div class="filters-panel-section">
    <filters-panel-section-title :title="title">
      <slot name="title"></slot>
    </filters-panel-section-title>
  </div>
</template>
