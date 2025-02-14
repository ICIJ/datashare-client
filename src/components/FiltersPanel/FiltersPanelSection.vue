<script setup>
import FiltersPanelSectionTitle from '@/components/FiltersPanel/FiltersPanelSectionTitle'

defineProps({
  title: {
    type: String
  }
})
</script>

<template>
  <div class="filters-panel-section w-100">
    <filters-panel-section-title :title="title">
      <slot name="title" />
    </filters-panel-section-title>
    <slot />
  </div>
</template>
