<script setup>
import EntitySectionListEntry from './EntitySectionListEntry'

defineProps({
  entries: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="d-flex flex-wrap gap-2">
    <slot v-bind="{ entries }">
      <entity-section-list-entry
        v-for="(entity, i) in entries"
        :key="i"
        :entity="entity"
      />
    </slot>
  </div>
</template>
